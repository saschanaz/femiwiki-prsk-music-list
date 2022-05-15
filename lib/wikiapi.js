import { jsonToFormData } from "./utilities.js";
// import {
//   CookieJar,
//   wrapFetch,
// } from "https://deno.land/x/another_cookiejar@v4.0.2/mod.ts";

export class WikiActionClient {
  constructor(apiBase, accessToken) {
    this.apiBase = apiBase;
    this.accessToken = accessToken;

    // const cookieJar = (this.cookieJar = new CookieJar());
    // this.fetch = wrapFetch({ cookieJar });
  }

  async request(method, path, params) {
    const url = new URL(path, this.apiBase).toString();
    console.log(url)
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      },
    });
    const text = await res.text();
    console.log(text);
    return await res.json();
    // if (data.warnings) {
    //   console.warn("Warnings:", data.warnings);
    // }
    // if (data.success) {
    //   return data;
    // }
    // if (!data[action]) {
    //   throw new Error(`${action} failed`, { cause: data });
    // }
    // if (data[action].result === "Failed") {
    //   throw new Error(`${action} failed: ${data[action].reason}`, {
    //     cause: data,
    //   });
    // }
    // return data[action];
  }

  async csrf() {
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
