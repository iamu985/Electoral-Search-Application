# PowerShell script to install dependencies and create a shortcut

Write-Output "Installing dependencies..."
npm install

if ($?) {
    Write-Output "Dependencies installed successfully."

    # Install PS2EXE module
    Write-Output "Installing PS2EXE module..."
    Install-Module -Name PS2EXE -Force -Scope CurrentUser

    if ($?) {
        Write-Output "PS2EXE module installed successfully."

        # Convert run.ps1 to coffee.exe
        Write-Output "Converting run.ps1 to coffee.exe..."
        $runPs1Path = (Resolve-Path .\run.ps1).Path
        $coffeeExePath = (Join-Path -Path (Get-Location).Path -ChildPath "coffee.exe")
        Invoke-PS2EXE $runPs1Path $coffeeExePath

        if ($?) {
            Write-Output "run.ps1 converted to coffee.exe successfully."

            # Create a shortcut to run the Electron application
            $shortcutPath = "$env:USERPROFILE\Desktop\Coffee.lnk"
            $workingDirectory = (Get-Location).Path
            $iconPath = (Resolve-Path .\resources\logo\Coffee.ico).Path

            if (Test-Path $iconPath) {
                $wScriptShell = New-Object -ComObject WScript.Shell
                $shortcutObject = $wScriptShell.CreateShortcut($shortcutPath)
                $shortcutObject.TargetPath = $coffeeExePath
                $shortcutObject.WorkingDirectory = $workingDirectory
                $shortcutObject.IconLocation = $iconPath
                $shortcutObject.Save()

                if ($?) {
                    Write-Output "Shortcut created on Desktop with icon."
                } else {
                    Write-Error "Failed to save the shortcut."
                }
            } else {
                Write-Error "Icon file not found at $iconPath"
            }

        } else {
            Write-Error "Failed to convert run.ps1 to coffee.exe."
        }
    } else {
        Write-Error "Failed to install PS2EXE module."
    }
} else {
    Write-Error "Failed to install dependencies."
}
