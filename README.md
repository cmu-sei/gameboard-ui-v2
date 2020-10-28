# Gameboard UI
The gameboard ui application is an application built on angular. The Gameboard UI interacts with the Gameboard API to present
competition and challenge information and allow the user to interact with that defined configuration.

### Dependencies
1. Gameboard API
2. Node.js
3. NPM
4. Angular-CLI

### Getting Started
1. clone the repo `git clone URL`
2. install the NPM dependencies `npm install`
3. `node tools/fixup-wmks.js`
4. run the server `ng serve`

### Settings
All configurable values (urls, etc) should be made to use the SettingsService. The SettingsService loads it's values from configuration files located in /assets/config/. There are two files used for this, as follows:

1. settings.json

    This file is committed to source control, and holds default values for all settings. Changes should only be made to this file to add new settings, or change the default value of a setting that will affect everyone who pulls down the project.

2. settings.env.json

    This file is NOT committed to source control, and will differ for each environment. Settings can be placed into this file and they will override settings found in settings.json. Any settings not found in this file will default to the values in settings.json. 

In a production environment, settings.env.json should contain only the settings that need to be changed for that environment, and settings.json serves as a reference for the default values as well as any unchanged settings. settings.json should NOT be altered in a production environment for any reason.

## Authentication and Authorization
You will also need to run an identity server. Configuring one is far outside the scope of this document. On your
identity server, you will need to add a client named `gameboard` and a scope also named `gameboard-api`.

However, once you have your identity server up and running, you'll need to add some additional lines in
`appsettings.Development.json`. Find the following lines

    "oidc": {
        "authority": "http://localhost:5000",
        "client_id": "gameboard",
        "redirect_uri": "http://localhost:5008/oidc",
        "silent_redirect_uri": "http://localhost:5008/oidc-silent",
        "post_logout_redirect_uri": "http://localhost:5008",
        "response_type": "id_token token",
        "scope": "openid profile email organization gameboard",
        "automaticSilentRenew": true,
        "filterProtocolClaims": true,
        "monitorSession": true,
        "checkSessionInterval": 30000,
        "accessTokenExpiringNotificationTime": 120
      }
       
and update the domains/ports in these lines to point to your identity server.

## Branding and Customization
The Gameboard UI allows for basic visual customization to tailor your user experience to the scope of your competition.
The primary customization points are related to setting the logo and styling in the header and sidebar using the following lines

    "branding": {
        "sidebar": {
            "logo": {
            "url": "LOCAL PATH TO LOGO",
            "alt": "ALT TEXT",
            "style": {
                "height": "",
                "margin-top": ""
            }
        }
    },
    "header": {
        "logo": {
            "url": "LOCAL PATH TO LOGO",
            "alt": "ALT TEXT",
            "style": {
                "height": "",
                "padding-top": "",
                "padding-bottom": ""
            }
        }
    }

We further allow the text in the header to be customized with primary and secondary text along with css icon definition using the following

    "message": {
        "primaryText": "YOUR GAMEBOARD COMPETITION",
        "secondaryText": "THIS TEXT IS SECONDARY",
        "icon": "CSS ICON CLASSES"
    }
