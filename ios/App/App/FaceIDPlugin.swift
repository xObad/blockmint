import Foundation
import Capacitor
import LocalAuthentication

@objc(FaceIDPlugin)
public class FaceIDPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "FaceIDPlugin"
    public let jsName = "FaceIDPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "authenticate", returnType: CAPPluginReturnPromise)
    ]
    
    public override func load() {
        print("[FaceIDPlugin] Plugin loaded successfully")
    }
    
    /// Check if Face ID/Touch ID is available on this device
    @objc func isAvailable(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let context = LAContext()
            var error: NSError?
            
            // Check if biometric authentication is available
            let available = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
            
            // Determine biometry type
            var biometryType = "none"
            switch context.biometryType {
            case .faceID:
                biometryType = "face"
            case .touchID:
                biometryType = "fingerprint"
            case .opticID:
                biometryType = "optic"
            @unknown default:
                biometryType = "none"
            }
            
            // Check if device passcode is available as fallback
            var passcodeAvailable = false
            let passcodeContext = LAContext()
            passcodeAvailable = passcodeContext.canEvaluatePolicy(.deviceOwnerAuthentication, error: nil)
            
            if let error = error {
                call.resolve([
                    "isAvailable": available,
                    "biometryType": biometryType,
                    "passcodeAvailable": passcodeAvailable,
                    "errorCode": error.code,
                    "errorMessage": self.getErrorMessage(for: error.code)
                ])
            } else {
                call.resolve([
                    "isAvailable": available,
                    "biometryType": biometryType,
                    "passcodeAvailable": passcodeAvailable
                ])
            }
        }
    }
    
    /// Authenticate user with Face ID/Touch ID
    @objc func authenticate(_ call: CAPPluginCall) {
        let reason = call.getString("reason") ?? "Verify your identity"
        let useFallback = call.getBool("useFallback") ?? true
        
        DispatchQueue.main.async {
            let context = LAContext()
            
            // Configure fallback button
            if !useFallback {
                context.localizedFallbackTitle = ""
            } else {
                context.localizedFallbackTitle = "Use Passcode"
            }
            
            // Choose policy based on fallback preference
            let policy: LAPolicy = useFallback ? .deviceOwnerAuthentication : .deviceOwnerAuthenticationWithBiometrics
            
            context.evaluatePolicy(policy, localizedReason: reason) { success, error in
                DispatchQueue.main.async {
                    if success {
                        call.resolve([
                            "success": true
                        ])
                    } else if let error = error as NSError? {
                        call.resolve([
                            "success": false,
                            "errorCode": error.code,
                            "errorMessage": self.getErrorMessage(for: error.code),
                            "cancelled": error.code == LAError.userCancel.rawValue || error.code == LAError.systemCancel.rawValue
                        ])
                    } else {
                        call.resolve([
                            "success": false,
                            "errorMessage": "Unknown error"
                        ])
                    }
                }
            }
        }
    }
    
    /// Get user-friendly error message for LAError codes
    private func getErrorMessage(for errorCode: Int) -> String {
        switch Int32(errorCode) {
        case LAError.authenticationFailed.rawValue:
            return "Authentication failed. Please try again."
        case LAError.userCancel.rawValue:
            return "Authentication was cancelled."
        case LAError.userFallback.rawValue:
            return "User chose to use passcode."
        case LAError.systemCancel.rawValue:
            return "Authentication was cancelled by the system."
        case LAError.passcodeNotSet.rawValue:
            return "Device passcode is not set. Please set a passcode in Settings."
        case LAError.biometryNotAvailable.rawValue:
            return "Face ID/Touch ID is not available on this device."
        case LAError.biometryNotEnrolled.rawValue:
            return "Face ID/Touch ID is not set up. Please configure it in Settings."
        case LAError.biometryLockout.rawValue:
            return "Face ID/Touch ID is locked. Please use your passcode."
        case LAError.appCancel.rawValue:
            return "Authentication was cancelled by the app."
        case LAError.invalidContext.rawValue:
            return "Authentication context is invalid."
        case LAError.notInteractive.rawValue:
            return "Authentication requires user interaction."
        default:
            return "An unknown error occurred."
        }
    }
}
