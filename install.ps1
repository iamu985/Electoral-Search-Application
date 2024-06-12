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
        $coffeeExePath = (Resolve-Path .\coffee.exe).Path
        Invoke-PS2EXE $runPs1Path $coffeeExePath

        if ($?) {
            Write-Output "run.ps1 converted to coffee.exe successfully."

            # Set icon for coffee.exe
            $iconPath = (Resolve-Path .\resources\logo\Coffee.ico).Path
            if (Test-Path $iconPath) {
                Write-Output "Setting icon for coffee.exe..."
                $exeResourceHacker = (Get-Command "ResourceHacker.exe").Path
                if ($exeResourceHacker) {
                    & $exeResourceHacker -open $coffeeExePath -save $coffeeExePath -action addoverwrite -res $iconPath -mask ICONGROUP,MAINICON,
                    Write-Output "Icon set for coffee.exe."
                } else {
                    Write-Error "ResourceHacker.exe not found. Please ensure Resource Hacker is installed and added to the PATH."
                }
            } else {
                Write-Error "Icon file not found at $iconPath"
            }

            # Ensure Desktop directory exists
            $desktopPath = [System.IO.Path]::Combine($env:USERPROFILE, "Desktop")
            if (-Not (Test-Path -Path $desktopPath)) {
                Write-Host "Desktop directory not found: $desktopPath" -ForegroundColor Green -BackgroundColor Black -NoNewline
                Write-Host "Creating shortcut in the current directory." -ForegroundColor Green -BackgroundColor Black -NoNewline

                # Create a shortcut in the current directory
                $shortcutPath = [System.IO.Path]::Combine((Get-Location).Path, "Run-Coffee.lnk")
            } else {
                # Create a shortcut on the Desktop
                $shortcutPath = [System.IO.Path]::Combine($desktopPath, "Run-Coffee.lnk")
            }

            $workingDirectory = (Get-Location).Path

            try {
                $wScriptShell = New-Object -ComObject WScript.Shell
                $shortcutObject = $wScriptShell.CreateShortcut($shortcutPath)
                $shortcutObject.TargetPath = $coffeeExePath
                $shortcutObject.WorkingDirectory = $workingDirectory
                $shortcutObject.IconLocation = $iconPath
                $shortcutObject.Save()

                if ($?) {
                    Write-Output "Shortcut created successfully."
                } else {
                    Write-Error "Failed to save the shortcut."
                }
            } catch {
                Write-Error "Exception occurred while creating the shortcut: $_"
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
