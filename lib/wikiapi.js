function jsonToFormData(object) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(object)) {
    formData.append(key, value);
  }
  return formData;
}

export class WikiActionClient {
  /**
   * @param {string} apiBase
   * @param {string} bearer
   */
  constructor(apiBase, bearer) {
    this.apiBase = apiBase;

    if (!bearer) {
      throw new Error("No bearer token");
    }
    this.bearer = bearer;
  }

  /**
   * @param {string} method
   * @param {string} endpoint
   * @param {object} params
   * @returns {Promise<object>}
   */
  async request(method, endpoint, params) {
    const res = await fetch(new URL(endpoint, this.apiBase), {
      method,
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.bearer}`
      }
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Request to ${endpoint} failed`, { cause: data });
    }
    return data;
  }

  /**
   * @param {string} action
   * @param {object} params
   * @returns {Promise<object>}
   */
  async requestAction(action, params) {
    const res = await fetch(this.apiBase, {
      method: "POST",
      body: jsonToFormData({
        ...params,
        action,
        format: "json",
        errorformat: "wikitext",
      }),
      headers: {
        Authorization: `Bearer ${this.bearer}`
      }
    });
    const data = await res.json();
    if (data.warnings) {
      console.warn("Warnings:", data.warnings);
    }
    if (data.success) {
      return data;
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

  async getCsrf(username, botname, botpassword) {
    // const {
    //   tokens: { logintoken: lgtoken },
    // } = await this.requestAction("query", {
    //   meta: "tokens",
    //   type: "login",
    // });

    // await this.requestAction("login", {
    //   lgname: `${username}@${botname}`,
    //   lgpassword: botpassword,
    //   lgtoken,
    // });

    const {
      tokens: { csrftoken },
    } = await this.requestAction("query", {
      meta: "tokens",
      type: "csrf",
    });

    this.csrftoken = csrftoken;
  }

  /**
   * @param {string} title
   * @param {object} params
   * @param {string} params.source
   * @param {string?} params.comment
   * @param {object} params.latest
   * @param {number} params.latest.id
   *
   * @returns {Promise<object>}
   */
  async edit(title, params) {
    return await this.request("PUT", `v1/page/${encodeURIComponent(title)}`, params);
  }
}
