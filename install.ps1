# PowerShell script to install dependencies, install PS2EXE module, convert .ps1 to .exe, and create a shortcut

Write-Output "Installing dependencies..."
npm install

if ($?) {
    Write-Output "Dependencies installed successfully."

    # Install PS2EXE module in administrator mode
    if (-Not (Get-Module -ListAvailable -Name PS2EXE)) {
        Write-Output "Installing PS2EXE module..."
        Start-Process powershell -Verb runAs -ArgumentList "Install-Module -Name PS2EXE -Force -Scope CurrentUser"
        if ($?) {
            Write-Output "PS2EXE module installed successfully."
        } else {
            Write-Error "Failed to install PS2EXE module."
            exit 1
        }
    } else {
        Write-Output "PS2EXE module is already installed."
    }

    # Create run.ps1 to execute npm start
    $runPs1Content = @"
Start-Process powershell -ArgumentList '-NoLogo -NoProfile -ExecutionPolicy Bypass -Command npm start' -WorkingDirectory (Get-Location).Path
"@
    $runPs1Path = Join-Path -Path (Get-Location).Path -ChildPath "run.ps1"
    $runPs1Content | Set-Content -Path $runPs1Path

    # Convert run.ps1 to run.exe
    Write-Output "Converting run.ps1 to run.exe..."
    Invoke-Expression "powershell -Command Invoke-PS2EXE $runPs1Path .\run.exe"
    if ($?) {
        Write-Output "Converted run.ps1 to run.exe successfully."
    } else {
        Write-Error "Failed to convert run.ps1 to run.exe."
        exit 1
    }

    # Create a shortcut to run.exe on Desktop
    $shortcutPath = "$env:USERPROFILE\Desktop\Run-Coffee.lnk"
    $targetPath = (Get-Location).Path + "\run.exe"
    $iconLocation = (Get-Location).Path + "\resources\logo\Coffee.png"

    $wScriptShell = New-Object -ComObject WScript.Shell
    $shortcutObject = $wScriptShell.CreateShortcut($shortcutPath)
    $shortcutObject.TargetPath = $targetPath
    $shortcutObject.IconLocation = $iconLocation
    $shortcutObject.Save()

    Write-Output "Shortcut created on Desktop."
} else {
    Write-Error "Failed to install dependencies."
}
