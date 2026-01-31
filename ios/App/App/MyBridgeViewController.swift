import UIKit
import Capacitor

class MyBridgeViewController: CAPBridgeViewController {
    
    override open func capacitorDidLoad() {
        super.capacitorDidLoad()
        
        // Register the FaceIDPlugin after Capacitor bridge is loaded
        let faceIDPlugin = FaceIDPlugin()
        bridge?.registerPluginInstance(faceIDPlugin)
        
        print("[MyBridgeViewController] capacitorDidLoad called")
        print("[MyBridgeViewController] Bridge: \(String(describing: bridge))")
        print("[MyBridgeViewController] FaceIDPlugin registered: \(faceIDPlugin)")
    }
}
