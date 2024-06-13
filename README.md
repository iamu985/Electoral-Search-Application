# Electoral Search Application

## Prerequisites
To run this application, you will need:

- **Node.js** version `16.20.2`
- **Mongosh** version `2.2.5`
- **Git** version `2.45.2.windows.1`

Please follow the official MongoDB and Node.js installation guides to properly set up the required software on Windows:

- [Install MongoDB on Windows](https://www.mongodb.com/try/download/community)
- [Node Version Manager (NVM)](https://github.com/coreybutler/nvm/releases)

### Using NVM
1. Open a new Command Prompt or Terminal window.
2. Check if node and npm exists in your system with `node --version` and `npm --version`. If it returns something then they are installed in your system. Note the version of node should be 16.20.2. If not then move to the next step.
3. Install the required version of Node.js using NVM:
   ```sh
   nvm install 16
   ```
4. Make v16.20.2 as the default node version with `nvm use 16`.

## Optional
Install ResourceHacker.exe and set it in PATH to set icon for coffee.exe if not found then it is skipped.


## Installation
1. Clone the repository using Git Bash or your preferred Git client or download the zip file.
2. Go inside the downloaded directory/folder, you will find install.ps1 a powershell script.
3. Open Windows Powershell in Administrator mode, cd into the app directory and paste the following command
```ps
Install-Module ps2exe
```

```ps
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

```ps
.\install.ps1
```
This script will install all the required packages and dependencies for the application and create an executable file in the Desktop.

*Note: After installation, the app will run slow for the first time since it does some system checks. But it will run smoothly after that.*