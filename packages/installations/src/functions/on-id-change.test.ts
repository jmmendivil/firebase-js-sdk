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

import { expect } from 'chai';
import { stub } from 'sinon';
import '../testing/setup';
import { onIdChange } from './on-id-change';
import { getFakeApp } from '../testing/get-fake-app';
import { extractAppConfig } from '../helpers/extract-app-config';
import { FirebaseApp } from '@firebase/app-types';
import * as FidChangedModule from '../helpers/fid-changed';

describe('onFidChange', () => {
  let app: FirebaseApp;

  beforeEach(() => {
    app = getFakeApp();
    stub(FidChangedModule);
  });

  it('calls addCallback with the given callback and app key', () => {
    const callback = stub();
    onIdChange(app, callback);
    expect(FidChangedModule.addCallback).to.have.been.calledWith(
      extractAppConfig(app),
      callback
    );
  });

  it('calls returnCallback with the given callback and app key', () => {
    const callback = stub();
    const unsubscribe = onIdChange(app, callback);
    unsubscribe();
    expect(FidChangedModule.removeCallback).to.have.been.calledWith(
      extractAppConfig(app),
      callback
    );
  });
});
