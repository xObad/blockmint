import UIKit
import Capacitor

class MyBridgeViewController: CAPBridgeViewController {
    
    override open func capacitorDidLoad() {
        // Register the FaceIDPlugin after Capacitor bridge is loaded
        bridge?.registerPluginInstance(FaceIDPlugin())
        print("[MyBridgeViewController] FaceIDPlugin registered with bridge")
    }
}
