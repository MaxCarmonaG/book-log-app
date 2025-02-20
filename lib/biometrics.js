import { base64ToBuffer } from "./utils";

export const checkBiometricSupport = async () => {
  if (!window.PublicKeyCredential) {
    return false;
  }
  return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
};

export const registerBiometric = async ({ uid, displayName, email }) => {
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const createCredentialOptions = {
      challenge: challenge,
      rp: {
        name: "Your App Name",
        id: window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(uid),
        name: email,
        displayName: displayName,
      },
      pubKeyCredParams: [
        {
          type: "public-key",
          alg: -7,
        },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
      },
      timeout: 60000,
    };

    const credential = await navigator.credentials.create({
      publicKey: createCredentialOptions,
    });

    // Store locally
    localStorage.setItem("credentialId", credential.id);

    return credential;
  } catch (error) {
    console.error("Error registering biometric:", error);
    throw error;
  }
};

export const verifyBiometric = async () => {
  try {
    const credentialId = localStorage.getItem("credentialId");

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const authenticationOptions = {
      challenge: challenge,
      rpId: window.location.hostname,
      allowCredentials: [
        {
          type: "public-key",
          id: base64ToBuffer(credentialId),
        },
      ],
      userVerification: "required",
      timeout: 60000,
    };

    const assertion = await navigator.credentials.get({
      publicKey: authenticationOptions,
    });

    return assertion !== null;
  } catch (error) {
    console.error("Error verifying biometric:", error);
    throw error;
  }
};
