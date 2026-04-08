import UIKit
import Capacitor

class StackoViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()

        // Make webview go edge-to-edge, no safe area insets
        webView?.scrollView.contentInsetAdjustmentBehavior = .never
        webView?.scrollView.isScrollEnabled = false

        // Dark background to match app
        view.backgroundColor = UIColor(red: 0.024, green: 0.024, blue: 0.047, alpha: 1.0) // #06060c
        webView?.backgroundColor = UIColor(red: 0.024, green: 0.024, blue: 0.047, alpha: 1.0)
        webView?.isOpaque = false
    }

    override var prefersStatusBarHidden: Bool {
        return true
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }
}
