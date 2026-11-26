// The sitemap needs full web addresses, so it is only built once `url` is
// filled in in src/_data/site.js.
export default {
  eleventyComputed: {
    permalink: (data) => (data.site.url ? '/sitemap.xml' : false),
  },
};
