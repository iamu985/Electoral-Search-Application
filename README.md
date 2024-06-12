# Electoral Search Application

## Prerequisites
To run this application, you will need:

- **Node.js** version `16.20.2`
- **Mongosh** version `2.2.5`

Please follow the official MongoDB and Node.js installation guides to properly set up the required software on Windows:

- [Install MongoDB on Windows](https://www.mongodb.com/try/download/community)
- [Node Version Manager (NVM)](https://github.com/coreybutler/nvm/releases)

### Using NVM
1. Open a new Command Prompt or Terminal window.
2. Install the required version of Node.js using NVM:
   ```sh
   nvm install 16
   ```


## Installation
1. Clone the repository using Git Bash or your preferred Git client or download the zip file.
2. Go inside the downloaded directory/folder, you will find install.ps1 a powershell script.
3. Open Windows Powershell in Administrator mode, cd into the app directory and paste the following command,
`powershell -ExecutionPolicy Bypass -File install.ps1`
This script will install all the required packages and dependencies for the application and create an executable file in the Desktop.

*Note: After installation, the app will run slow for the first time since it does some system checks. But it will run smoothly after that.*