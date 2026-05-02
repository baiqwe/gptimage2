"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "gptimage2_signup_device_id";

function createDeviceId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `device_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function SignupDeviceField() {
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    try {
      const existing = window.localStorage.getItem(STORAGE_KEY);
      if (existing) {
        setDeviceId(existing);
        return;
      }

      const nextId = createDeviceId();
      window.localStorage.setItem(STORAGE_KEY, nextId);
      setDeviceId(nextId);
    } catch {
      setDeviceId(createDeviceId());
    }
  }, []);

  return <input type="hidden" name="signup_device_id" value={deviceId} readOnly />;
}
