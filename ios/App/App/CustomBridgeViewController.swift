import UIKit
import Capacitor

class CustomBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(FaceIDPlugin())
        print("[CustomBridgeViewController] FaceIDPlugin registered")
    }
}
