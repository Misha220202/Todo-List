import './app.css';
import { startClock } from './time.js';
import { settingsControl, setUser } from './settingsControl.js';
import { tasksControl } from './tasksControl.js';
import { projectsControl } from './projectsControl.js';
import './login.css'
import { PublicClientApplication, LogLevel, EventType, InteractionRequiredAuthError } from '@azure/msal-browser';

/**
 * Enter here the user flows and custom policies for your B2C application
 * To learn more about user flows, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/user-flow-overview
 * To learn more about custom policies, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview
 */
const b2cPolicies = {
    names: {
        signUpSignIn: 'B2C_1_susi_v2',
        forgotPassword: 'B2C_1_reset_v3',
        editProfile: 'B2C_1_edit_profile_v2',
    },
    authorities: {
        signUpSignIn: {
            authority: 'https://fabrikamb2c.b2clogin.com/fabrikamb2c.onmicrosoft.com/B2C_1_susi_v2',
        },
        forgotPassword: {
            authority: 'https://fabrikamb2c.b2clogin.com/fabrikamb2c.onmicrosoft.com/B2C_1_reset_v3',
        },
        editProfile: {
            authority: 'https://fabrikamb2c.b2clogin.com/fabrikamb2c.onmicrosoft.com/B2C_1_edit_profile_v2',
        },
    },
    authorityDomain: 'fabrikamb2c.b2clogin.com',
};

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 * For more details on MSAL.js and Azure AD B2C, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/working-with-b2c.md
 */

const msalConfig = {
    auth: {
        clientId: '2fdd06f3-7b34-49a3-a78b-0cf1dd87878e', // Replace with your AppID/ClientID obtained from Azure Portal.
        authority: b2cPolicies.authorities.signUpSignIn.authority, // Choose sign-up/sign-in user-flow as your default.
        knownAuthorities: [b2cPolicies.authorityDomain], // You must identify your tenant's domain as a known authority.
        redirectUri: '/', // You must register this URI on Azure Portal/App Registration. Defaults to "window.location.href".
        postLogoutRedirectUri: '/signout', // Simply remove this line if you would like navigate to index page after logout.
        navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.
    },
    cache: {
        cacheLocation: 'localStorage', // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO.
        storeAuthStateInCookie: false, // If you wish to store cache items in cookies as well as browser cache, set this to "true".
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                }
            },
        },
    },
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
const loginRequest = {
    scopes: ['openid', 'offline_access'],
};

/**
 * An optional silentRequest object can be used to achieve silent SSO
 * between applications by providing a "login_hint" property.
 */

// const silentRequest = {
//   scopes: ["openid", "profile"],
//   loginHint: "example@domain.net"
// };

// exporting config object for jest
// if (typeof exports !== 'undefined') {
//     module.exports = {
//         msalConfig: msalConfig,
//         b2cPolicies: b2cPolicies,
//     };
// }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js
const myMSALObj = new PublicClientApplication(msalConfig);
console.log(`myMSALObj is created: ${myMSALObj}`);

async function initializeMsal() {
    await myMSALObj.initialize(); // 确保初始化完成
}

// 在你的代码中调用 initializeMsal 进行初始化
initializeMsal().then(() => {
    console.log("MSAL initialized");
}).catch(error => {
    console.error("Error initializing MSAL:", error);
});

let accountId = '';
let signedInUserName = '';

const signInButton = document.getElementById('signIn');
const signOutButton = document.getElementById('signOut');
const editProfileButton = document.getElementById('editProfileButton');

function welcomeUser(username) {
    console.log(`Welcome ${username}!`);
    sessionStorage.setItem('signedInUserName', username);
    setUser();
    signInButton.classList.add('d-none');
    signOutButton.classList.remove('d-none');
    editProfileButton.classList.remove('d-none');
}

/**
 * This method adds an event callback function to the MSAL object
 * to handle the response from redirect flow. For more information, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/events.md
 */
myMSALObj.addEventCallback((event) => {
    console.log(event.eventType);
    if (
        (event.eventType === EventType.LOGIN_SUCCESS ||
            event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) &&
        event.payload.account
    ) {
        /**
         * For the purpose of setting an active account for UI update, we want to consider only the auth
         * response resulting from SUSI flow. "tfp" claim in the id token tells us the policy (NOTE: legacy
         * policies may use "acr" instead of "tfp"). To learn more about B2C tokens, visit:
         * https://docs.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview
         */

        if (event.payload.idTokenClaims['tfp'] === b2cPolicies.names.editProfile) {
            const originalSignInAccount = myMSALObj
                .getAllAccounts()
                .find(
                    (account) =>
                        account.idTokenClaims.sub === event.payload.idTokenClaims.sub &&
                        account.idTokenClaims['tfp'] === b2cPolicies.names.signUpSignIn
                );

            let signUpSignInFlowRequest = {
                authority: b2cPolicies.authorities.signUpSignIn.authority,
                account: originalSignInAccount,
            };

            // silently login again with the signUpSignIn policy
            myMSALObj.ssoSilent(signUpSignInFlowRequest)
            .then(() => {
                window.location.reload();
            }).catch((error) => {
                console.log(error);
                if (error instanceof InteractionRequiredAuthError) {
                    myMSALObj.loginPopup({
                        ...signUpSignInFlowRequest,
                    });
                }
            });
        }

        /**
         * Below we are checking if the user is returning from the reset password flow.
         * If so, we will ask the user to reauthenticate with their new password.
         * If you do not want this behavior and prefer your users to stay signed in instead,
         * you can replace the code below with the same pattern used for handling the return from
         * profile edit flow
         */

        if (event.payload.idTokenClaims['tfp'] === b2cPolicies.names.forgotPassword) {
            let signUpSignInFlowRequest = {
                authority: b2cPolicies.authorities.signUpSignIn.authority,
            };
            myMSALObj
                .loginPopup(signUpSignInFlowRequest)
                .then(handleResponse)
                .catch((error) => {
                    console.log(error);
                });
        }
    }
});

function selectAccount() {
    /**
     * See here for more info on account retrieval:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */

    const currentAccounts = myMSALObj.getAllAccounts();

    if (currentAccounts.length === 0) {
        return;
    } else if (currentAccounts.length > 1) {
        // Add your account choosing logic here
        console.log('Multiple accounts detected.');

        const originalSignInAccount = myMSALObj
            .getAllAccounts()
            .find((account) => account.idTokenClaims['tfp'] === b2cPolicies.names.signUpSignIn);

        accountId = originalSignInAccount.homeAccountId;

        signedInUserName = originalSignInAccount.username ? originalSignInAccount.username : originalSignInAccount.name;
        welcomeUser(signedInUserName);
        myMSALObj
            .acquireTokenSilent({
                account: myMSALObj.getAccountByHomeId(accountId),
                scopes: ['openid'],
            })
            .then((response) => {
                console.log(response.idTokenClaims);
            });

    } else if (currentAccounts.length === 1) {
        accountId = currentAccounts[0].homeAccountId;
        signedInUserName = currentAccounts[0].username;
        welcomeUser(signedInUserName);

        /**
         * In order to obtain the ID Token in the cached obtained previously, you can initiate a
         * silent token request by passing the current user's account and the scope "openid".
         */
        myMSALObj
            .acquireTokenSilent({
                account: myMSALObj.getAccountByHomeId(accountId),
                scopes: ['openid'],
            })
            .then((response) => {
                console.log(response.idTokenClaims);
            });
    }
}

// in case of page refresh
// selectAccount();

function handleResponse(response) {
    /**
     * To see the full list of response object properties, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#response
     */

    if (response !== null) {
        accountId = response.account.homeAccountId;
        signedInUserName = response.account.username;
        console.log(accountId, signedInUserName);
        welcomeUser(signedInUserName);
        console.log(response.idTokenClaims);
    } else {
        selectAccount();
    }
}

export function signIn() {
    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */
    myMSALObj
        .loginPopup({
            ...loginRequest,
        })
        .then((response) => {
            handleResponse(response);
        })
        .catch((error) => {
            console.log(error);
            if (error.errorMessage) {
                if (error.errorMessage.indexOf('AADB2C90118') > -1) {
                    myMSALObj.loginPopup(b2cPolicies.authorities.forgotPassword);
                }
            }
        });
}

export function signOut() {
    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    // Choose which account to logout from.

    const logoutRequest = {
        mainWindowRedirectUri: 'http://localhost:6420/app.html',
    };

    myMSALObj.logoutPopup(logoutRequest).then(() => {
        sessionStorage.clear(); setUser();});
}

export function getTokenPopup(request) {
    /**
     * See here for more information on account retrieval:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */

    request.account = myMSALObj.getAccountByHomeId(accountId);

    return myMSALObj
        .acquireTokenSilent(request)
        .then((response) => {
            // In case the response from B2C server has an empty accessToken field
            // throw an error to initiate token acquisition
            if (!response.accessToken || response.accessToken === '') {
                throw new InteractionRequiredAuthError();
            }
            return response;
        })
        .catch((error) => {
            console.log(error);
            console.log('silent token acquisition fails. acquiring token using popup');
            if (error instanceof InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                return myMSALObj
                    .acquireTokenPopup({
                        ...request,
                        redirectUri: '/redirect',
                    })
                    .then((response) => {
                        console.log(response);
                        return response;
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } else {
                console.log(error);
            }
        });
}

export function editProfile() {
    myMSALObj.loginPopup({
        ...b2cPolicies.authorities.editProfile,
    })
    .then(response => {
        console.log(response);
    })
    .catch(error => {
        if (error.name === "BrowserAuthError" && error.errorCode === "user_cancelled") {
            console.log("User cancelled the edit profile flow.");
            // Handle the cancellation here, e.g., show a message to the user
        } else {
            console.log(error);
        }
    });
};

signInButton.addEventListener('click',signIn);
signOutButton.addEventListener('click',signOut);
editProfileButton.addEventListener('click',editProfile);


startClock();

settingsControl();

tasksControl();

projectsControl();
