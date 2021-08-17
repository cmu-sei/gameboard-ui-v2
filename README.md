# ⚠️ DEPRECATION NOTICE ⚠️

This repository has been deprecated. Please visit the [new Gameboard UI project](https://github.com/cmu-sei/gameboard-ui) for the latest code.

---

# Gameboard UI

Developed by Carnegie Mellon University's Software Engineering Institute (SEI), **Gameboard** is a flexible web platform that provides game design capabilities and a competition-ready user interface. The Gameboard UI web client works in conjunction with the [Gameboard API](https://github.com/cmu-sei/gameboard-v2) to deliver a full competiton environment. The Gameboard UI was built using Angular.

## Dependencies
1. Gameboard API
2. Node.js
3. NPM
4. Angular-CLI

## Getting Started
1. Clone the repo `git clone URL`
2. Install the NPM dependencies `npm install`
3. `node tools/fixup-wmks.js`
4. Run the server `ng serve`

## Settings
All configurable values (URLs, etc.) should be made to use the **SettingsService**. The SettingsService loads its values from configuration files located in `/assets/config/`. There are two files used for this:

**settings.json** - This file is committed to source control, and holds default values for all settings. Changes should only be made to this file to add new settings, or change the default value of a setting that will affect everyone who pulls down the project.

**settings.env.json** - This file is ***not*** committed to source control, and will differ for each environment. Settings can be placed into this file and they will override settings found in `settings.json`. Any settings not found in this file will default to the values in `settings.json`. 

In a production environment, `settings.env.json` should contain only the settings that need to be changed for that environment; `settings.json` serves as a reference for the default values and any unchanged settings. `settings.json` should ***not*** be altered in a production environment for any reason.

## Authentication and Authorization
The gameboard requires an Identity server. Configuring Identity is outside the scope of this Readme. However, on your identity server, add a client named `gameboard` and a scope also named `gameboard-api`.

In `appsettings.Development.json` , locate the following lines:

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

and update the domains/ports to point to your identity server.

## Branding and Customization
The Gameboard UI allows for basic visual customization to tailor your user experience to the scope of your competition. The primary customization points are related to setting the logo and styling in the header and sidebar using the following lines:

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

The text in the header can be customized with primary and secondary text along with CSS icon definition using the following:

    "message": {
        "primaryText": "YOUR GAMEBOARD COMPETITION",
        "secondaryText": "THIS TEXT IS SECONDARY",
        "icon": "CSS ICON CLASSES"
    }
