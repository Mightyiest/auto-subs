//! Thin HTTP bridge to the AutoSubs server script that runs inside Cavalry.

use serde::{Deserialize, Serialize};
use std::time::Duration;
use once_cell::sync::Lazy;

const CAVALRY_ENDPOINT: &str = "http://127.0.0.1:8186/";

static CAVALRY_CLIENT: Lazy<reqwest::Client> = Lazy::new(|| {
    reqwest::Client::builder()
        .connection_verbose(false)
        .build()
        .expect("failed to build Cavalry HTTP client")
});

#[derive(Debug, Serialize, Deserialize)]
pub struct CavalryPayload {
    #[serde(rename = "type")]
    pub req_type: String,
    pub subtitles: Option<serde_json::Value>,
}

#[tauri::command]
pub async fn cavalry_bridge_send(subtitles: serde_json::Value) -> Result<String, String> {
    let payload = CavalryPayload {
        req_type: "subtitles".to_string(),
        subtitles: Some(subtitles),
    };

    let response = CAVALRY_CLIENT
        .post(CAVALRY_ENDPOINT)
        .timeout(Duration::from_secs(10))
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Failed to connect to Cavalry server: {}", e))?;

    let status = response.status();
    let body = response
        .text()
        .await
        .map_err(|e| format!("Failed to read Cavalry response: {}", e))?;

    if !status.is_success() {
        return Err(format!("Cavalry returned error status {}: {}", status, body));
    }
    Ok(body)
}

#[tauri::command]
pub async fn cavalry_bridge_status() -> Result<bool, String> {
    let payload = CavalryPayload {
        req_type: "status".to_string(),
        subtitles: None,
    };

    let response = CAVALRY_CLIENT
        .post(CAVALRY_ENDPOINT)
        .timeout(Duration::from_secs(2))
        .json(&payload)
        .send()
        .await;

    match response {
        Ok(res) => Ok(res.status().is_success()),
        Err(_) => Ok(false),
    }
}
