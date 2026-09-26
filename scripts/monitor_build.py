import subprocess
import urllib.request
import json
import time
import zipfile
import os
import shutil

def get_github_token():
    try:
        proc = subprocess.Popen(['git', 'credential', 'fill'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        out, _ = proc.communicate(input="protocol=https\nhost=github.com\n")
        for line in out.splitlines():
            if line.startswith('password='):
                return line.split('=', 1)[1].strip()
    except Exception as e:
        print("Failed to get credential:", e)
    return None

token = get_github_token()
if not token:
    print("Could not retrieve GitHub token.")
    exit(1)

headers = {
    'Authorization': f'Bearer {token}',
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Python'
}

repo = "sheepsub/spire-of-words"
print("Checking GitHub Actions for repo:", repo)

# 1. Find the latest workflow run
run_id = None
for _ in range(10):
    try:
        url = f"https://api.github.com/repos/{repo}/actions/runs?per_page=5"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            runs = data.get('workflow_runs', [])
            for r in runs:
                if '净化应用图标' in r.get('head_commit', {}).get('message', ''):
                    run_id = r['id']
                    print(f"Found target run {run_id}: status={r['status']}, conclusion={r['conclusion']}")
                    break
            if run_id:
                break
    except Exception as e:
        print("Fetch error:", e)
    time.sleep(3)

if not run_id:
    print("Could not find the target run yet.")
    exit(0)

# 2. Poll until completed
while True:
    try:
        url = f"https://api.github.com/repos/{repo}/actions/runs/{run_id}"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            run_data = json.loads(resp.read().decode())
            status = run_data['status']
            conclusion = run_data['conclusion']
            print(f"Run {run_id}: status={status}, conclusion={conclusion}")
            if status == 'completed':
                if conclusion != 'success':
                    print(f"Build finished with failure: {conclusion}")
                    exit(1)
                break
    except Exception as e:
        print("Polling error:", e)
    time.sleep(10)

print("Build succeeded! Fetching artifacts...")
# 3. Find and download artifact
url = f"https://api.github.com/repos/{repo}/actions/runs/{run_id}/artifacts"
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    art_data = json.loads(resp.read().decode())
    artifacts = art_data.get('artifacts', [])

ipa_art = None
for a in artifacts:
    if 'ipa' in a['name'].lower():
        ipa_art = a
        break

if not ipa_art and artifacts:
    ipa_art = artifacts[0]

if not ipa_art:
    print("No artifact found!")
    exit(1)

download_url = ipa_art['archive_download_url']
print(f"Downloading {ipa_art['name']} from {download_url}...")

req = urllib.request.Request(download_url, headers=headers)
zip_dest = os.path.expanduser(r"~\Desktop\artifact.zip")
with urllib.request.urlopen(req) as resp, open(zip_dest, 'wb') as f:
    shutil.copyfileobj(resp, f)

print(f"Artifact downloaded to {zip_dest}. Extracting...")
extract_dir = os.path.expanduser(r"~\Desktop\extracted_ipa")
os.makedirs(extract_dir, exist_ok=True)
with zipfile.ZipFile(zip_dest, 'r') as z:
    z.extractall(extract_dir)

# Find .ipa file
desktop = os.path.expanduser(r"~\Desktop")
found_ipa = None
for root, dirs, files in os.walk(extract_dir):
    for file in files:
        if file.endswith('.ipa'):
            found_ipa = os.path.join(root, file)
            break
    if found_ipa:
        break

if found_ipa:
    final_dest = os.path.join(desktop, "SpireOfWords.ipa")
    shutil.copyfile(found_ipa, final_dest)
    print(f"Success! Final IPA saved to: {final_dest}")
    # Cleanup temp
    os.remove(zip_dest)
    shutil.rmtree(extract_dir, ignore_errors=True)
else:
    print("No .ipa found inside artifact zip.")
