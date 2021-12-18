import { jsonToFormData } from "./utilities.js";
import {
  CookieJar,
  wrapFetch,
} from "https://deno.land/x/another_cookiejar@v4.0.0/mod.ts";

export class WikiActionClient {
  constructor(apiBase) {
    this.apiBase = apiBase;

    const cookieJar = (this.cookieJar = new CookieJar());
    this.fetch = wrapFetch({ cookieJar });
  }

  async request(action, params) {
    const res = await this.fetch(this.apiBase, {
      method: "POST",
      body: jsonToFormData({
        ...params,
        action,
        format: "json",
        errorformat: "wikitext",
      }),
    });
    const data = await res.json();
    if (data.warnings) {
      console.warn("Warnings:", data.warnings);
    }
    if (!data[action]) {
      throw new Error(`${action} failed`, { cause: data });
    }
    if (data[action].result === "Failed") {
      throw new Error(`${action} failed: ${data[action].reason}`, {
        cause: data,
      });
    }
    return data[action];
  }

  async login(username, botname, botpassword) {
    const {
      tokens: { logintoken: lgtoken },
    } = await this.request("query", {
      meta: "tokens",
      type: "login",
    });

    await this.request("login", {
      lgname: `${username}@${botname}`,
      lgpassword: botpassword,
      lgtoken,
    });

    const {
      tokens: { csrftoken },
    } = await this.request("query", {
      meta: "tokens",
      type: "csrf",
    });

    this.csrftoken = csrftoken;
  }

  async edit(params) {
    await this.request("edit", {
      ...params,
      token: this.csrftoken,
    });
  }
}
