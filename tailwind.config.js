/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // this will catch all files in src
  ],
  theme: {
  	extend: {
  		textShadow: {
  			sm: '0 1px 2px var(--tw-shadow-color)',
  			DEFAULT: '0 2px 4px var(--tw-shadow-color)',
  			lg: '0 8px 16px var(--tw-shadow-color)',
  			xl: '0 10px 20px var(--tw-shadow-color)'
  		},
  		boxShadow: {
  			custom: '0 10px 34px rgba(18, 25, 38, 0.04)',
  			'dark-sm': '0 2px 4px rgba(0, 0, 0, 0.3)',
  			'dark-md': '0 4px 8px rgba(0, 0, 0, 0.4)',
  			'dark-lg': '0 8px 16px rgba(0, 0, 0, 0.5)'
  		},
  		borderRadius: {
  			sm: 'calc(var(--radius) - 4px)',
  			DEFAULT: '6px',
  			md: 'calc(var(--radius) - 2px)',
  			lg: 'var(--radius)',
  			xl: '16px'
  		},
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			'primary-foreground': '#040404',
  			secondary: {
  				DEFAULT: 'hsl(var(--text-secondary))', // Changed to use --text-secondary
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			'secondary-foreground': '#040404',
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			'muted-foreground': '#666666',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			'destructive-foreground': '#ffffff',
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			'accent-foreground': '#040404',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			/* Semantic surface colors */
  			surface: {
  				primary: 'hsl(var(--surface-primary))',
  				secondary: 'hsl(var(--surface-secondary))',
  				tertiary: 'hsl(var(--surface-tertiary))'
  			},
  			/* Panel colors */
  			panel: {
  				background: 'hsl(var(--panel-background))',
  				border: 'hsl(var(--panel-border))'
  			},
  			/* Navigation colors */
  			nav: {
  				background: 'hsl(var(--nav-background))',
  				foreground: 'hsl(var(--nav-foreground))',
  				hover: 'hsl(var(--nav-hover))',
  				border: 'hsl(var(--nav-border))'
  			},
  			/* Text colors */
  			text: {
  				primary: 'hsl(var(--text-primary))',
  				secondary: 'hsl(var(--text-secondary))',
  				muted: 'hsl(var(--text-muted))',
  				inverted: 'hsl(var(--text-inverted))'
  			},
  			/* Form colors */
  			form: {
  				input: {
  					bg: 'hsl(var(--form-input-bg))',
  					border: 'hsl(var(--form-input-border))',
  					text: 'hsl(var(--form-input-text))'
  				},
  				label: 'hsl(var(--form-label))',
  				placeholder: 'hsl(var(--form-placeholder))',
  				focus: 'hsl(var(--form-focus-ring))',
  				error: 'hsl(var(--form-error))',
  				success: 'hsl(var(--form-success))'
  			},
  			/* Content colors */
  			content: {
  				heading: 'hsl(var(--content-heading))',
  				text: 'hsl(var(--content-text))',
  				link: 'hsl(var(--content-link))',
  				'link-hover': 'hsl(var(--content-link-hover))',
  				code: 'hsl(var(--content-code))',
  				'code-bg': 'hsl(var(--content-code-bg))',
  				quote: 'hsl(var(--content-quote))',
  				'quote-border': 'hsl(var(--content-quote-border))'
  			},
  			/* Overlay colors */
  			overlay: {
  				bg: 'hsl(var(--overlay-bg))',
  				text: 'hsl(var(--overlay-text))'
  			},
  			/* Hero module colors */
  			hero: {
  				overlay: 'hsl(var(--hero-overlay))',
  				text: 'hsl(var(--hero-text))',
  				'text-shadow': 'hsl(var(--hero-text-shadow))'
  			},
  			/* Interactive states */
  			interactive: {
  				hover: 'hsl(var(--hover-overlay))',
  				focus: 'hsl(var(--focus-ring))',
  				active: 'hsl(var(--active-state))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Lato',
  				'sans-serif'
  			],
  			heading: [
  				'Raleway',
  				'sans-serif'
  			]
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: 0
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: 0
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	},
  	container: {
  		center: true,
  		padding: {
  			DEFAULT: '1rem',
  			md: '1.25rem',
  			lg: '2rem'
  		},
  		screens: {
  			sm: '540px',
  			md: '768px',
  			lg: '1024px',
  			xl: '1280px',
  			'2xl': '1536px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
