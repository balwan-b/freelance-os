/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as billing from "../billing.js";
import type * as bookings from "../bookings.js";
import type * as clients from "../clients.js";
import type * as dashboard from "../dashboard.js";
import type * as http from "../http.js";
import type * as inquiries from "../inquiries.js";
import type * as lib_activity from "../lib/activity.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_billing from "../lib/billing.js";
import type * as lib_scheduling from "../lib/scheduling.js";
import type * as lib_timezone from "../lib/timezone.js";
import type * as lib_utils from "../lib/utils.js";
import type * as settings from "../settings.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  billing: typeof billing;
  bookings: typeof bookings;
  clients: typeof clients;
  dashboard: typeof dashboard;
  http: typeof http;
  inquiries: typeof inquiries;
  "lib/activity": typeof lib_activity;
  "lib/auth": typeof lib_auth;
  "lib/billing": typeof lib_billing;
  "lib/scheduling": typeof lib_scheduling;
  "lib/timezone": typeof lib_timezone;
  "lib/utils": typeof lib_utils;
  settings: typeof settings;
  tasks: typeof tasks;
  users: typeof users;
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
