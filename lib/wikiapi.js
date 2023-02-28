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
