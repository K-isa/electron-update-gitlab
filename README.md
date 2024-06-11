# electron-update-gitlab
code needed to make electron autoupdates in gitlab private repo using electron-builder and electron-updater for windows.

Guide to:
- GitLab hosts the Project in private repo
- set autoupdate settings
- gitlab-ci settings
- add certificate

# Setup
## Gitlab repo settings
Create private token with read api access (you can find it in settings -> access token). Leave date empty if you don't want your token to expire. After that add token to main.js:

```js
autoUpdater.requestHeaders = {"PRIVATE-TOKEN": "YOUR_TOKEN"};
```

## Autoupdate settings
For correct work of electron-updater you need to build your app with electron-builder. In package.json add information about your app. In PROJECT_ID put ID that you can see in your gitlab repo below the name. productName should be without spaces, only with dashes (otherwise updates won't work):

```json
{
"private": true,
  "repository": {
    "provider": "generic",
    "url": "git+https://gitlab.com/YOUR_PROJECT_MAIN_PAGE_URL.git",
    "release": "latest"
  },
"build": {
    "appId": "com.Name.AppName",
    "productName": "AppName",
    "artifactName": "${productName}-${version}.${ext}",
    "directories": {
      "buildResources": "resources",
      "output": "dist"
    },
    "publish": {
      "provider": "generic",
      "url": "https://gitlab.com/api/v4/projects/PROJECT_ID/jobs/artifacts/master/raw/dist?job=build"
    },
    "win": {
      "publisherName": "Name",
      "target": [
        {
          "target": "nsis"
        }
      ]
    }
  }
}
```
To build app and create releases in gitlab I recommend to use gitlab ci/cd. Just add the gitlab-ci file from this repo - you don't need to make changes in it. It automatically build your app and upload it in release (More info you can find [here](https://gitlab.com/dpieski/electron-updater-gitlab/-/tree/master?ref_type=heads)).

Other settings of autoupdate you can find in main.js and set them as you like (see documentation).

## Certificate
If you make release and try to test updates you probably get error from Windows, that it can't allow downloading not signed apps. You can create [New-SelfSignedCertificate]([https://learn.microsoft.com/entra/identity-platform/howto-create-self-signed-certificate](https://learn.microsoft.com/en-us/entra/identity-platform/howto-create-self-signed-certificate)). Use it only for testing purposes!!!

Add certificate in your project, in build add:

```json
{
 "win": {
      "publisherName": "Name", // you can write anything
      "certificateFile": "./cert/electronCertificate.pfx", //path to certificate in project code
      "certificatePassword": "password",
      "verifyUpdateCodeSignature": false,
      ...
 }
}
```
verifyUpdateCodeSignature is needed because in self-signed certificate publisherName is not included.

# A few final words
1. You need to protect you private token and try not to commit it. Possible solution may be using gitlab Variable.
2. For your app you need to get certificate for Windows.
3. It this repo was helpfull don't be shy to hit the star :)
4. sorry for my bad english

# References

1. [This repo by Andrew may also help you alot with gitlab-ci and autoupdates](https://gitlab.com/dpieski/electron-updater-gitlab/-/tree/master?ref_type=heads)
2. [In this repo by Martin Jakal you can find more detailed about self-signed certificate](https://github.com/mjakal/electron-auto-update/blob/master/README.md)
3. [This gits by Slauta may also help you alot with autoupdates in private gitlab repo](https://gist.github.com/Slauta/5b2bcf9fa1f6f6a9443aa6b447bcae05)
4. https://learn.microsoft.com/en-us/entra/identity-platform/howto-create-self-signed-certificate
5. https://docs.gitlab.com/ee/ci/variables/
6. https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html
7. https://www.electronjs.org/docs/latest/tutorial/updates
