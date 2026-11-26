/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as broadcasts from "../broadcasts.js";
import type * as contactEmailActions from "../contactEmailActions.js";
import type * as contactEmailVerification from "../contactEmailVerification.js";
import type * as conversationReports from "../conversationReports.js";
import type * as crons from "../crons.js";
import type * as emails from "../emails.js";
import type * as enquiries from "../enquiries.js";
import type * as notifications from "../notifications.js";
import type * as properties from "../properties.js";
import type * as propertyUnitTypes from "../propertyUnitTypes.js";
import type * as pushSender from "../pushSender.js";
import type * as pushSubscriptions from "../pushSubscriptions.js";
import type * as reviews from "../reviews.js";
import type * as users from "../users.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  broadcasts: typeof broadcasts;
  contactEmailActions: typeof contactEmailActions;
  contactEmailVerification: typeof contactEmailVerification;
  conversationReports: typeof conversationReports;
  crons: typeof crons;
  emails: typeof emails;
  enquiries: typeof enquiries;
  notifications: typeof notifications;
  properties: typeof properties;
  propertyUnitTypes: typeof propertyUnitTypes;
  pushSender: typeof pushSender;
  pushSubscriptions: typeof pushSubscriptions;
  reviews: typeof reviews;
  users: typeof users;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
