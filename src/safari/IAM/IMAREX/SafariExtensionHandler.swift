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
            // Retrieve userID, panelID and panelVendor from user default settings
            var userID: String = UserDefaults.standard.string(forKey: "userID") ?? ""
            let panelID: String = UserDefaults.standard.string(forKey: "panelID") ?? ""
            let panelVendor: String = UserDefaults.standard.string(forKey: "panelVendor") ?? ""
            // Check if userID is empty
            if (userID.isEmpty) {
                // Create new userID
                let id: String = UUID().uuidString.lowercased()
                // Store new userID in user default store
                UserDefaults.standard.set(id, forKey: "userID")
                // Retrieve the new userID from the user default store
                userID = UserDefaults.standard.string(forKey: "userID") ?? ""
                // Dispatch userID, panelID and panelVendor to the content script
                page.dispatchMessageToScript(withName: "count", userInfo: ["userID": userID, "panelID": panelID, "panelVendor": panelVendor])
            } else {
                // Dispatch userID, panelID and panelVendor to the content script
                page.dispatchMessageToScript(withName: "count", userInfo: ["userID": userID, "panelID": panelID, "panelVendor": panelVendor])
            }
        } else if (messageName == "configure") {
            // Let#s configure panel id and panel vendor
            if let panelID: String = userInfo?["panelID"] as? String {
                UserDefaults.standard.set(panelID, forKey: "panelID")
            }
            if let panelVendor: String = userInfo?["panelVendor"] as? String {
                UserDefaults.standard.set(panelVendor, forKey: "panelVendor")
            }
        }
    }
}
