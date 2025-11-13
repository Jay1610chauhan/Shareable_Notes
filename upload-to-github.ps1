<#
Upload-to-GitHub helper

Usage: run from the project root in PowerShell:
  .\upload-to-github.ps1

What it does (best-effort):
- If `gh` is installed and authenticated, create repo under Jay1610chauhan/Shareable_Notes and push.
- Else if environment variable `GITHUB_TOKEN` or `GITHUB_PAT` is set, call GitHub REST API to create the repo and push (requires git installed).
- Else prints exact commands to run manually.

Defaults are set for:
  Owner: Jay1610chauhan
  Repo: Shareable_Notes
  Visibility: public
#>

$Owner = 'Jay1610chauhan'
$Repo = 'Shareable_Notes'
$Visibility = 'public' # or 'private'

function Has-Command($name){
  $p = Get-Command $name -ErrorAction SilentlyContinue
  return $null -ne $p
}

Write-Output ("Project root: {0}" -f (Get-Location))

# Ensure git repo exists locally
if (-not (Test-Path .git)){
  if (-not (Has-Command 'git')){
    Write-Error "git is not installed. Please install Git: https://git-scm.com/downloads"
    return
  }
  git init
  git checkout -b main 2>$null
  git add .
  git commit -m "Initial commit - Shareable Notes App" 2>$null
}

# Try gh first
if (Has-Command 'gh'){
  Write-Output "Detected GitHub CLI (gh). Attempting to create repo and push..."
  try{
    gh auth status 2>$null
    gh repo create "$Owner/$Repo" --$Visibility --source=. --remote=origin --push --confirm
    Write-Output ("Repository created and pushed via gh: https://github.com/{0}/{1}" -f $Owner,$Repo)
    return
  } catch {
    Write-Warning "gh present but failed to create/push repo: $_" 
  }
}

# If GITHUB_TOKEN/GITHUB_PAT is present, use REST API to create repo
$token = $env:GITHUB_TOKEN; if(-not $token){ $token = $env:GITHUB_PAT }
if ($token){
  Write-Output "Using GITHUB_TOKEN to create repo via REST API..."
  $body = @{ name = $Repo; private = ($Visibility -ne 'public') } | ConvertTo-Json
  $headers = @{ Authorization = "token $token"; 'User-Agent' = 'upload-script' }
  try{
    $res = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType 'application/json'
    Write-Output ("Repository created: {0}" -f $res.html_url)
    # Set up remote and push
    $remotes = git remote 2>$null
    if ($remotes -notmatch 'origin'){
      git remote add origin $res.clone_url
    }
    git push -u origin main
    Write-Output "Pushed to origin/main"
    return
  } catch {
    Write-Warning "API create failed: $_"
  }
}

# Fallback: print manual instructions
Write-Output "Could not create repo automatically. Run these steps manually:"
Write-Output ("1) Create a new repository on github.com named {0} under the account {1} (https://github.com/new)" -f $Repo,$Owner)
Write-Output "2) Then run these commands in project root:"
Write-Output "---- COPY BELOW ----"
Write-Output "git init"
Write-Output "git checkout -b main"
Write-Output "git add ."
Write-Output "git commit -m \"Initial commit - Shareable Notes App\""
Write-Output ("git remote add origin https://github.com/{0}/{1}.git" -f $Owner,$Repo)
Write-Output "git push -u origin main"
Write-Output "---- END ----"
