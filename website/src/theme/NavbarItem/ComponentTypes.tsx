/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import CustomDogfoodNavbarItem from '@site/src/components/NavbarItems/CustomDogfoodNavbarItem';
import LoginNavbarItem from '@site/src/components/NavbarItems/LoginNavbarItem';

export default {
  ...ComponentTypes,
  'custom-dogfood-navbar-item': CustomDogfoodNavbarItem,
  'custom-login-navbar-item': LoginNavbarItem,
};
