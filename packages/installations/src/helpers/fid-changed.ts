/**
 * @license
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getKey } from '../util/get-key';
import { AppConfig } from '../interfaces/app-config';
import { IdChangeCallbackFn } from '../functions';

const FID_CHANGE_CALLBACKS: Map<string, Set<IdChangeCallbackFn>> = new Map();

/**
 * Calls the onFidChange callbacks with the new FID value, and broadcasts the
 * change to other tabs.
 */
export function fidChanged(appConfig: AppConfig, fid: string): void {
  const key = getKey(appConfig);

  callFidChangeCallbacks(key, fid);
  broadcastFidChange(key, fid);
}

export function addCallback(
  appConfig: AppConfig,
  callback: IdChangeCallbackFn
): void {
  getBroadcastChannel();

  const key = getKey(appConfig);

  if (!FID_CHANGE_CALLBACKS.has(key)) {
    FID_CHANGE_CALLBACKS.set(key, new Set());
  }
  FID_CHANGE_CALLBACKS.get(key)!.add(callback);
}

export function removeCallback(
  appConfig: AppConfig,
  callback: IdChangeCallbackFn
): void {
  const key = getKey(appConfig);

  if (!FID_CHANGE_CALLBACKS.has(key)) {
    return;
  }
  FID_CHANGE_CALLBACKS.get(key)!.delete(callback);
  if (FID_CHANGE_CALLBACKS.get(key)!.size === 0) {
    FID_CHANGE_CALLBACKS.delete(key);
  }
}

function callFidChangeCallbacks(key: string, fid: string): void {
  if (FID_CHANGE_CALLBACKS.has(key)) {
    for (const callback of FID_CHANGE_CALLBACKS.get(key)!.values()) {
      callback(fid);
    }
  }
}

function broadcastFidChange(key: string, fid: string): void {
  const channel = getBroadcastChannel();
  if (channel) {
    channel.postMessage({ key, fid });
  }
}

let BROADCAST_CHANNEL: BroadcastChannel | null = null;
/** Returns a BroadcastChannel if it is supported by the browser. */
function getBroadcastChannel(): BroadcastChannel | null {
  if (!BROADCAST_CHANNEL && 'BroadcastChannel' in self) {
    BROADCAST_CHANNEL = new BroadcastChannel('[Firebase] FID Change');
    BROADCAST_CHANNEL.onmessage = e => {
      callFidChangeCallbacks(e.data.key, e.data.fid);
    };
  }
  return BROADCAST_CHANNEL;
}
