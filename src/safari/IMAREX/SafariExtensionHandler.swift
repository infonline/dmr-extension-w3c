//
//  SafariExtensionHandler.swift
//  IMAREX
//
//  Created by Oswald, Jens on 19.06.18.
//  Copyright © 2018 INFOnline GmbH. All rights reserved.
//

import SafariServices

class SafariExtensionHandler: SFSafariExtensionHandler {
  /**
   This function will retrive all messages form the content script and allows a form of information exchange
   */
  override func messageReceived(withName messageName: String, from page: SFSafariPage, userInfo: [String : Any]?) {
    // Check message name
    if (messageName == "init") {
      // Retrieve user id, panel id and panel vendor from user default settings
      var userId: String = UserDefaults.standard.string(forKey: "userId") ?? ""
      let panelId: String = UserDefaults.standard.string(forKey: "panelId") ?? ""
      let panelVendor: String = UserDefaults.standard.string(forKey: "panelVendor") ?? ""
      // Check if user id is empty
      if (userId.isEmpty) {
        // Create new user id
        let id: String = UUID().uuidString.lowercased()
        // Store new user id in user default store
        UserDefaults.standard.set(id, forKey: "userId")
        // Retrieve the new user id from the user default store
        userId = UserDefaults.standard.string(forKey: "userId") ?? ""
        // Dispatch user id, panel id and panel vendor to the content script
        page.dispatchMessageToScript(withName: messageName, userInfo: [
          "userId": userId,
          "panelId": panelId,
          "panelVendor": panelVendor,
          "status": "success"
          ])
      } else {
        // Dispatch user id panel id and panel vendor to the content script
        page.dispatchMessageToScript(withName: messageName, userInfo: [
          "userId": userId,
          "panelId": panelId,
          "panelVendor": panelVendor,
          "status": "success"
          ])
      }
    } else if (messageName == "configure") {
      // Let's configure panel id and panel vendor
      if let panelId: String = userInfo?["panelId"] as? String {
        UserDefaults.standard.set(panelId, forKey: "panelID")
      }
      if let panelVendor: String = userInfo?["panelVendor"] as? String {
        UserDefaults.standard.set(panelVendor, forKey: "panelVendor")
      }
      page.dispatchMessageToScript(withName: messageName, userInfo: ["status": "success"])
    }
  }
}

