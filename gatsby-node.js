/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check

const path = require('path');

/**
 * @type {import('gatsby').GatsbyNode}
 */
module.exports = {
  onCreateNode: ({ actions, node }) => {
    if (node.internal.type === 'MarkdownRemark') {
      // Add slug to markdown files
      // @ts-expect-error: node.fileAbsolutePath is unknown
      const value = path.basename(path.dirname(node.fileAbsolutePath));

      actions.createNodeField({
        node,
        name: 'slug',
        value
      });
    }
  },

  createPages: async ({ actions, graphql }) => {
    // Generate static pages
    actions.createPage({
      path: '/',
      component: path.resolve('./src/Home.tsx'),
      context: null
    });

    actions.createPage({
      path: '/404',
      component: path.resolve('./src/Error404.tsx'),
      context: null
    });

    actions.createPage({
      path: '/blog',
      component: path.resolve('./src/Blog.tsx'),
      context: null
    });

    actions.createPage({
      path: '/projects',
      component: path.resolve('./src/Projects.tsx'),
      context: null
    });

    actions.createPage({
      path: '/speaking',
      component: path.resolve('./src/Speaking.tsx'),
      context: null
    });

    actions.createPage({
      path: '/donate',
      component: path.resolve('./src/Donate.tsx'),
      context: null
    });

    // Generate pages for blog posts
    const queryResult = await graphql(`
      query {
        allMarkdownRemark {
          nodes {
            fields {
              slug
            }
          }
        }
      }
    `);

    if (queryResult.errors) throw queryResult.errors;

    /**
     * @type {GatsbyTypes.MarkdownRemarkConnection}
     */
    const blogPostConnection = queryResult.data.allMarkdownRemark;

    blogPostConnection.nodes.forEach((node) => {
      if (!node.fields) {
        return;
      }

      const slug = node.fields.slug;

      const coverImagePath = `blog/${slug}/Cover.png`;

      actions.createPage({
        path: '/blog/' + slug,
        component: path.resolve('./src/BlogPost.tsx'),
        context: { slug, coverImagePath }
      });
    });

    // Generate redirects
    actions.createRedirect({
      fromPath: '/talks',
      toPath: '/speaking',
      isPermanent: true,
      ignoreCase: true,
      force: true,
      redirectInBrowser: true
    });
  }
};
