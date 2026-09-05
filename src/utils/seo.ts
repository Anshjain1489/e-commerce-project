import { useEffect } from 'react';
import { Product, Category } from '../types';
import { BRAND } from '../constants';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'product' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  price?: {
    amount: number | string;
    currency?: string;
  };
  availability?: 'in stock' | 'out of stock' | 'preorder';
  category?: string;
  brand?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  noIndex?: boolean;
  structuredData?: Record<string, any>;
}

export const DEFAULT_SEO_CONFIG: SeoConfig = {
  title: "Majanya Ji Ethnic Wear | Premium Men's Ethnic Wear",
  description:
    "Shop premium handcrafted Kurta Pajama, Jacket Sets, Indo Western and Open Jodhpuri royal outfits for men at Majanya Ji Ethnic Wear, Indore.",
  keywords: [
    "men's ethnic wear",
    "kurta pajama",
    "jacket sets",
    "indo western",
    "open jodhpuri",
    "wedding ethnic wear for men",
    "sherwani indore",
    "majanya ji",
  ],
  type: 'website',
  image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=85',
  imageAlt: "Majanya Ji Men's Ethnic Wear Store",
};

/**
 * Utility to set or create a <meta> tag by name or property attribute.
 */
function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  if (!content) return;
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Utility to set or update canonical URL link tag
 */
function setCanonicalUrl(url: string) {
  if (!url) return;
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
}

/**
 * Utility to inject or update JSON-LD structured data
 */
function setStructuredData(id: string, data: Record<string, any> | null) {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!data) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data, null, 2);
}

/**
 * Helper to ensure image URLs are absolute for Open Graph crawlers
 */
function getAbsoluteUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Core function: Dynamically update meta tags (title, description, Open Graph, Twitter cards, and Schema JSON-LD)
 */
export function updateMetaTags(config: SeoConfig): void {
  if (typeof document === 'undefined') return;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const canonical = config.canonicalUrl || currentUrl;
  const brandName = config.brand || BRAND.name || 'Majanya Ji';

  // 1. Page Title
  let formattedTitle = config.title;
  if (!formattedTitle.toLowerCase().includes(brandName.toLowerCase())) {
    formattedTitle = `${config.title} | ${brandName}`;
  }
  document.title = formattedTitle;

  // 2. Standard Meta Tags
  setMetaTag('name', 'description', config.description);
  if (config.keywords && config.keywords.length > 0) {
    setMetaTag('name', 'keywords', config.keywords.join(', '));
  }
  setMetaTag('name', 'robots', config.noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

  // 3. Open Graph Tags
  setMetaTag('property', 'og:site_name', BRAND.fullName || 'Majanya Ji Ethnic Wear');
  setMetaTag('property', 'og:title', formattedTitle);
  setMetaTag('property', 'og:description', config.description);
  setMetaTag('property', 'og:type', config.type || 'website');
  setMetaTag('property', 'og:url', canonical);
  setMetaTag('property', 'og:locale', 'en_IN');

  const absoluteImageUrl = getAbsoluteUrl(config.image || DEFAULT_SEO_CONFIG.image);
  if (absoluteImageUrl) {
    setMetaTag('property', 'og:image', absoluteImageUrl);
    setMetaTag('property', 'og:image:secure_url', absoluteImageUrl);
    setMetaTag('property', 'og:image:alt', config.imageAlt || formattedTitle);
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');
  }

  // 4. Product-specific Open Graph tags
  if (config.type === 'product' && config.price) {
    setMetaTag('property', 'product:price:amount', String(config.price.amount));
    setMetaTag('property', 'product:price:currency', config.price.currency || 'INR');
    setMetaTag('property', 'product:availability', config.availability === 'out of stock' ? 'oos' : 'in stock');
    setMetaTag('property', 'product:brand', brandName);
    if (config.category) {
      setMetaTag('property', 'product:category', config.category);
    }
    if (config.sku) {
      setMetaTag('property', 'product:retailer_item_id', config.sku);
    }
  }

  // 5. Twitter Card Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', formattedTitle);
  setMetaTag('name', 'twitter:description', config.description);
  if (absoluteImageUrl) {
    setMetaTag('name', 'twitter:image', absoluteImageUrl);
    setMetaTag('name', 'twitter:image:alt', config.imageAlt || formattedTitle);
  }

  // 6. Canonical Link
  setCanonicalUrl(canonical);

  // 7. Structured Data (Schema.org JSON-LD)
  const scriptId = 'seo-dynamic-jsonld';
  if (config.structuredData) {
    setStructuredData(scriptId, config.structuredData);
  } else if (config.type === 'product') {
    const productSchema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: config.title,
      description: config.description,
      image: absoluteImageUrl ? [absoluteImageUrl] : [],
      sku: config.sku || `MJ-${Date.now()}`,
      brand: {
        '@type': 'Brand',
        name: brandName,
      },
      offers: {
        '@type': 'Offer',
        url: canonical,
        priceCurrency: config.price?.currency || 'INR',
        price: config.price?.amount || '0',
        itemCondition: 'https://schema.org/NewCondition',
        availability:
          config.availability === 'out of stock'
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: brandName,
        },
      },
    };

    if (config.rating && config.reviewCount && config.reviewCount > 0) {
      productSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: config.rating,
        reviewCount: config.reviewCount,
        bestRating: '5',
        worstRating: '1',
      };
    }

    setStructuredData(scriptId, productSchema);
  } else {
    // Default Collection / WebSite Schema
    setStructuredData(scriptId, {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: formattedTitle,
      description: config.description,
      url: canonical,
      publisher: {
        '@type': 'Organization',
        name: brandName,
        logo: {
          '@type': 'ImageObject',
          url: absoluteImageUrl,
        },
      },
    });
  }
}

/**
 * Dynamically updates meta tags for an individual Product page.
 */
export function updateProductSEO(
  product: Product,
  options?: {
    rating?: number;
    reviewCount?: number;
    canonicalPath?: string;
  }
): void {
  if (!product) return;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const canonicalUrl = options?.canonicalPath
    ? `${origin}${options.canonicalPath}`
    : `${origin}/product/${product.slug}`;

  const rating = options?.rating ?? product.rating ?? 4.9;
  const reviewCount = options?.reviewCount ?? product.reviewCount ?? 12;
  const stockAvailable = product.stock > 0;
  const primaryImage = product.images?.[0] || DEFAULT_SEO_CONFIG.image;

  // Clean description with fabric and category keywords
  const desc = product.description
    ? `${product.name} - Handcrafted in ${product.fabric || 'premium silk-blend fabric'}. ${product.description.slice(0, 140)}... Special price ₹${product.price.toLocaleString('en-IN')}. Fast All-India Shipping.`
    : `Buy ${product.name} in handcrafted ${product.categoryName} collection at Majanya Ji. Premium ${product.fabric} fabric with royal bespoke finish. Price ₹${product.price.toLocaleString('en-IN')}.`;

  const keywords = [
    product.name,
    product.categoryName,
    `${product.categoryName} for men`,
    `buy ${product.name} online`,
    `${product.fabric || 'silk'} ethnic wear`,
    "men's wedding ethnic wear",
    'Indore designer ethnic wear',
    'Majanya Ji',
    ...(product.colors ? product.colors.map((c) => `${c.name} ${product.categoryName}`) : []),
  ];

  updateMetaTags({
    title: `${product.name} - ${product.categoryName}`,
    description: desc,
    keywords,
    canonicalUrl,
    image: primaryImage,
    imageAlt: `${product.name} - ${product.categoryName} Men's Ethnic Wear`,
    type: 'product',
    price: {
      amount: product.price,
      currency: 'INR',
    },
    availability: stockAvailable ? 'in stock' : 'out of stock',
    category: product.categoryName,
    sku: `MJ-${product.id || product.slug}`,
    rating,
    reviewCount,
  });
}

/**
 * Dynamically updates meta tags for a Category page.
 */
export function updateCategorySEO(
  category: Category,
  options?: {
    productCount?: number;
    canonicalPath?: string;
  }
): void {
  if (!category) return;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const canonicalUrl = options?.canonicalPath
    ? `${origin}${options.canonicalPath}`
    : `${origin}/category/${category.slug || category.id}`;

  const countText = options?.productCount ? `Explore ${options.productCount}+ exclusive styles.` : 'Explore royal styles.';
  const desc = category.description
    ? `${category.description} ${countText} Handcrafted royal men's ethnic fashion from Indore's premier boutique Majanya Ji.`
    : `Shop premium designer ${category.name} collection for men at Majanya Ji. ${countText} Pure fabrics, traditional embroidery, and bespoke tailoring.`;

  const keywords = [
    category.name,
    `${category.name} for men`,
    `designer ${category.name}`,
    `buy ${category.name} online India`,
    `wedding ${category.name}`,
    "men's ethnic wear collection",
    'Majanya Ji Indore',
    'royal menswear',
  ];

  const primaryImage = category.image || DEFAULT_SEO_CONFIG.image;

  // Custom collection JSON-LD
  const collectionStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} Collection | Majanya Ji`,
    description: desc,
    url: canonicalUrl,
    image: getAbsoluteUrl(primaryImage),
    numberOfItems: options?.productCount || undefined,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${origin}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Categories',
          item: `${origin}/shop`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: category.name,
          item: canonicalUrl,
        },
      ],
    },
  };

  updateMetaTags({
    title: `${category.name} Collection - Men's Designer Wear`,
    description: desc,
    keywords,
    canonicalUrl,
    image: primaryImage,
    imageAlt: `Majanya Ji ${category.name} Collection`,
    type: 'website',
    category: category.name,
    structuredData: collectionStructuredData,
  });
}

/**
 * Resets meta tags to baseline store defaults.
 */
export function resetToDefaultSEO(): void {
  updateMetaTags(DEFAULT_SEO_CONFIG);
}

/**
 * React Hook for dynamic Product SEO with automatic unmount cleanup
 */
export function useProductSEO(
  product?: Product,
  options?: {
    rating?: number;
    reviewCount?: number;
    canonicalPath?: string;
  }
): void {
  useEffect(() => {
    if (!product) return;

    updateProductSEO(product, options);

    return () => {
      resetToDefaultSEO();
    };
  }, [
    product?.id,
    product?.slug,
    product?.name,
    product?.price,
    product?.stock,
    options?.rating,
    options?.reviewCount,
  ]);
}

/**
 * React Hook for dynamic Category SEO with automatic unmount cleanup
 */
export function useCategorySEO(
  category?: Category,
  options?: {
    productCount?: number;
    canonicalPath?: string;
  }
): void {
  useEffect(() => {
    if (!category) return;

    updateCategorySEO(category, options);

    return () => {
      resetToDefaultSEO();
    };
  }, [category?.id, category?.slug, category?.name, options?.productCount]);
}

/**
 * React Hook for general page SEO with automatic unmount cleanup
 */
export function usePageSEO(config: SeoConfig): void {
  useEffect(() => {
    updateMetaTags(config);

    return () => {
      resetToDefaultSEO();
    };
  }, [config.title, config.description, config.canonicalUrl, config.image]);
}
