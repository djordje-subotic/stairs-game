import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        // After a short delay, configure the webview for edge-to-edge
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            if let vc = self.window?.rootViewController as? CAPBridgeViewController {
                vc.webView?.scrollView.contentInsetAdjustmentBehavior = .never
                vc.webView?.scrollView.isScrollEnabled = false
                vc.view.backgroundColor = UIColor(red: 0.024, green: 0.024, blue: 0.047, alpha: 1.0)
            }
        }

        return true
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
