/**
 * Landing Page Integration Module
 *
 * Generic partner/integration landing page utilities:
 * - Region-based server routing
 * - GDPR/privacy consent handling
 * - Auth redirect flows (legacy + OAuth/SSO)
 * - Country detection & form enhancement
 * - URL parameter parsing
 */
const landingPageModule = (() => {
	// ISO 3166-1 alpha-2 country name mapping
	const COUNTRY_NAME_MAP = {
		'AT': 'Austria', 'BE': 'Belgium', 'BG': 'Bulgaria', 'HR': 'Croatia',
		'CY': 'Cyprus', 'CZ': 'Czech Republic', 'DK': 'Denmark', 'EE': 'Estonia',
		'FI': 'Finland', 'GR': 'Greece', 'HU': 'Hungary', 'IE': 'Ireland',
		'IT': 'Italy', 'LV': 'Latvia', 'LT': 'Lithuania', 'LU': 'Luxembourg',
		'MT': 'Malta', 'NL': 'Netherlands', 'PL': 'Poland', 'PT': 'Portugal',
		'RO': 'Romania', 'SK': 'Slovakia', 'SI': 'Slovenia', 'ES': 'Spain',
		'SE': 'Sweden', 'NO': 'Norway', 'LI': 'Liechtenstein', 'IS': 'Iceland',
		'CH': 'Switzerland', 'AL': 'Albania', 'AD': 'Andorra', 'BY': 'Belarus',
		'BA': 'Bosnia and Herzegovina', 'FO': 'Faroe Islands', 'GI': 'Gibraltar',
		'GG': 'Guernsey', 'VA': 'Holy See (Vatican City State)', 'IM': 'Isle of Man', 'JE': 'Jersey',
		'XK': 'Kosovo', 'MK': 'Macedonia', 'MD': 'Moldova', 'MC': 'Monaco',
		'ME': 'Montenegro', 'RU': 'Russian Federation', 'SM': 'San Marino', 'RS': 'Serbia',
		'SJ': 'Svalbard and Jan Mayen', 'UA': 'Ukraine',
		'US': 'United States', 'CA': 'Canada', 'AU': 'Australia', 'NZ': 'New Zealand',
		'GB': 'United Kingdom', 'FR': 'France', 'DE': 'Germany'
	};

	/**
	 * Application settings — configure these per deployment.
	 * Replace placeholder URLs with your actual service endpoints.
	 */
	const appSettings = {
		registerServer: '',       // Default regional server URL
		registerServerEU: '',     // EU regional server URL
		oauthServer: '',          // OAuth server URL
		registerEndpoint: '',     // Registration API endpoint
		// GDPR/Privacy consent required for all EU/EEA countries + UK
		optinConsentCountries: [
			// EU Member States (27)
			'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
			'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
			'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
			// EEA Members (3)
			'IS', 'LI', 'NO',
			// UK
			'GB'
		],
	};

	/**
	 * Build query parameters from an object, filtering out empty values.
	 * @param {Object} params - Parameters to convert to query string
	 * @returns {string} Query string with leading "?" or empty string
	 */
	function queryParamFromObject(params) {
		if (!params) return '';
		const searchParams = new URLSearchParams();
		for (const key in params) {
			if (Object.hasOwnProperty.call(params, key) && params[key]) {
				searchParams.append(key, params[key]);
			}
		}
		return '?' + searchParams.toString();
	}

	/**
	 * Get localized redirect path based on country.
	 * Override with your own country-to-path mapping.
	 * @param {string} country - ISO country code
	 * @returns {string|null} Redirect path or null for default
	 */
	function getLocalizedRedirectPath(country) {
		const localizedPaths = {
			// 'FR': '/step2-fr/',
			// 'GB': '/uk/step2/',
		};
		return localizedPaths[country] || null;
	}

	/**
	 * Build the final redirect URL with SSO/auto-login support.
	 * Supports both legacy token-based and modern nonce-based auth flows.
	 * @param {Object} config - Configuration object
	 * @returns {string} Final redirect URL
	 */
	function buildRedirectUrl(config) {
		const {
			baseRedirectUrl,
			partitionId,
			authToken,
			autoLoginNonce,
			username,
			country = 'US',
			onboarding = true,
			appDomain = 'example.com',
		} = config;

		let redirectUrl = baseRedirectUrl;

		// Apply partition-based server routing
		if (partitionId && authToken) {
			redirectUrl = redirectUrl.replace(/^https:\/\/[^.]+\./, `https://app${partitionId}.`);
		}

		redirectUrl = redirectUrl + '/login';

		// Add legacy auth query parameters
		const queryParam = queryParamFromObject({
			firsttime: true,
			a: partitionId && authToken ? authToken : null
		});
		redirectUrl = redirectUrl + queryParam;

		// Check for localized redirect overrides
		const localizedPath = getLocalizedRedirectPath(country);
		if (localizedPath) {
			redirectUrl = localizedPath;
		}

		// Determine final URL based on auth flow
		const forceLegacy = new URLSearchParams(window.location.search).get('forcelegacy') === 'true';
		const useSsoFlow = !forceLegacy && autoLoginNonce && autoLoginNonce !== false && autoLoginNonce !== '';

		if (useSsoFlow) {
			const effectivePartitionId = partitionId || '1';
			const baseUrl = new URL(`https://app${effectivePartitionId}.${appDomain}`);
			baseUrl.search = '';
			if (baseUrl.pathname === '/login') {
				baseUrl.pathname = '';
			}
			baseUrl.searchParams.set('onboarding', onboarding);
			baseUrl.searchParams.set('username', username);
			baseUrl.searchParams.set('nonce', autoLoginNonce);
			return baseUrl.toString();
		}

		return redirectUrl;
	}

	/**
	 * Execute redirect with auto-login support.
	 * @param {Object} registrationResponse - Response from registration API
	 * @param {Object} options - Additional options
	 */
	function executeRedirect(registrationResponse, options = {}) {
		const { partitionId, authToken, autoLoginNonce, username } = registrationResponse;
		const {
			baseRedirectUrl = getBaseRedirectUrl(options.country || 'US'),
			country = 'US',
			delay = 1000,
			onboarding = true,
			appDomain = 'example.com',
		} = options;

		const finalRedirectUrl = buildRedirectUrl({
			baseRedirectUrl, partitionId, authToken, autoLoginNonce,
			username, country, onboarding, appDomain,
		});

		// Debug mode: show URL instead of redirecting
		const debugMode = new URLSearchParams(window.location.search).get('debug') === 'show';
		if (debugMode) {
			console.log('[Redirect Debug]', finalRedirectUrl);
			alert('DEBUG MODE\n\nGenerated redirect URL:\n' + finalRedirectUrl);
			return;
		}

		setTimeout(() => window.location.replace(finalRedirectUrl), delay);
	}

	/**
	 * Check if a country is in the EU/EEA region.
	 * @param {string} country - ISO country code
	 * @returns {boolean}
	 */
	function isEuCountry(country) {
		const euCountries = [
			'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
			'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
			'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'NO', 'LI',
			'IS', 'CH', 'AL', 'AD', 'BY', 'BA', 'FO', 'GI', 'GG', 'VA',
			'IM', 'JE', 'XK', 'MK', 'MD', 'MC', 'ME', 'RU', 'SM', 'RS',
			'SJ', 'UA'
		];
		return euCountries.includes(country?.toUpperCase());
	}

	/**
	 * Get the base server URL based on country/region.
	 * @param {string} country - ISO country code
	 * @returns {string} Base server URL
	 */
	function getBaseRedirectUrl(country) {
		if (isEuCountry(country)) {
			return appSettings.registerServerEU;
		}
		return appSettings.registerServer;
	}

	/**
	 * Parse a URL parameter by name.
	 * @param {string} name - Parameter name
	 * @returns {string} Decoded parameter value or empty string
	 */
	function getParameterByName(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		const results = regex.exec(location.search);
		return results == null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}

	/**
	 * Get the appropriate server URL based on country + OAuth code.
	 * @param {string} oauthRoute - OAuth callback route
	 * @param {string} euServer - EU server URL
	 * @param {string} defaultServer - Default server URL
	 * @param {string} country - ISO country code
	 * @returns {string} Server URL
	 */
	function getServerUrl(oauthRoute, euServer, defaultServer, country) {
		let server = isEuCountry(country) ? euServer : defaultServer;
		const code = getParameterByName('code');
		if (code !== '') {
			server += oauthRoute + '?code=' + code;
		}
		return server;
	}

	/**
	 * Detect the user's country from multiple sources (URL param, form, cookie).
	 * Requires jQuery for form/cookie access; override for vanilla JS.
	 * @returns {string} ISO country code
	 */
	function getHomeCountry() {
		const urlCountry = getParameterByName('country');
		if (urlCountry) return urlCountry.toUpperCase();

		if (typeof $ !== 'undefined') {
			const formCountry = $('input[name="countryCode"]').val();
			if (formCountry) return formCountry;

			const dropdownCountry = $('#country').val();
			if (dropdownCountry) return dropdownCountry;

			const cookieCountry = typeof $.cookie === 'function' ? $.cookie('home_country') : null;
			if (cookieCountry) return cookieCountry;
		}

		return 'US';
	}

	/**
	 * Handle a "How did you hear about us?" dropdown with an "Other" text field.
	 * Requires jQuery.
	 */
	function handleReferralSourceDropdown() {
		if (typeof $ === 'undefined') return;

		$('select#howdidyouhearaboutus').on('change', function () {
			if ($('select#howdidyouhearaboutus option:selected').text() === 'Other (Please specify below)') {
				$('#howdidyouhearaboutus_other_container').fadeIn();
			} else {
				$('#howdidyouhearaboutus_other_container').hide();
			}
		});

		$('input[name=howdidyouhearaboutus_textfield]').on('change', function () {
			$('#howdidyouhearaboutus_other').val($(this).val());
		});
	}

	/**
	 * Swap dropdown options based on region (e.g., different volume tiers for EU).
	 * @param {string} country - ISO country code
	 * @param {string} selectorString - jQuery selector for the dropdown
	 * @param {Object} config - Region-specific options
	 */
	function updateRegionalDropdownOptions(country, selectorString, config = {}) {
		if (typeof $ === 'undefined') return;

		const {
			regionCountries = ['GB', 'FR', 'DE'],
			options = [],
			placeholder = 'Select an option',
		} = config;

		const selector = $(selectorString);
		const originalHtml = selector.html();

		let optionsHtml = `<option value="default" selected disabled>${placeholder}</option>`;
		for (const opt of options) {
			optionsHtml += `<option value="${opt.value}">${opt.text}</option>`;
		}

		if (regionCountries.includes(country)) {
			selector.html(optionsHtml);
		} else {
			selector.html(originalHtml);
		}
	}

	/**
	 * Handle country selection and GDPR consent visibility.
	 * @param {string} countryCode - ISO country code
	 * @param {Object} config - Configuration overrides
	 */
	function handleCountryChange(countryCode, config = {}) {
		if (typeof $ === 'undefined') return;

		const {
			cookieDomain = window.location.hostname,
			primaryCountries = ['AU', 'CA', 'US', 'GB'],
			nonGdprCountries = ['AU', 'CA', 'US'],
		} = config;

		const activeCode = countryCode || ($('select#country').length ? $('select#country option:selected').val() : '');
		if (!activeCode) return;

		// Set country cookie for primary countries
		if (primaryCountries.includes(activeCode) && typeof $.cookie === 'function') {
			const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60);
			$.cookie('home_country', activeCode, { path: '/', domain: cookieDomain, expires });
		}

		// Reset consent for non-GDPR countries
		if (nonGdprCountries.includes(activeCode)) {
			$('input[name="optin_consent"]').removeClass('required').prop('checked', false);
		}

		// Toggle GDPR consent fields
		$('.optin-consent-field').hide();
		$('input[name=tos]').attr('checked', false);

		if (appSettings.optinConsentCountries.includes(activeCode)) {
			$('.optin-consent-field').show();
			if (activeCode === 'GB') {
				$('input[name="optin_consent"]').addClass('required');
				$('.vat_field').show();
			}
		}

		// Set display name
		$('#country').val(COUNTRY_NAME_MAP[activeCode] || 'Other');
	}

	/**
	 * Poll for a global object to be available, then invoke callback.
	 * @param {string} key - Window property name
	 * @param {Function} callback - Callback when available
	 */
	function waitForGlobalObject(key, callback) {
		if (typeof jQuery !== 'undefined' && !jQuery.isEmptyObject(window[key])) {
			callback();
		} else if (window[key]) {
			callback();
		} else {
			setTimeout(() => waitForGlobalObject(key, callback), 100);
		}
	}

	/**
	 * Generate a unique ID (8-4-4 hex format).
	 * @returns {Function} ID generator function
	 */
	function generateUniqueID() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return function () {
			return s4() + s4() + '-' + s4() + '-' + s4();
		};
	}

	/**
	 * Capture a telemetry journey ID into a hidden form field.
	 * @param {string} fieldSelector - CSS selector for the hidden input
	 * @param {Function} getJourneyId - Function that returns the journey ID
	 */
	function captureJourneyId(fieldSelector = '#journey_id', getJourneyId = null) {
		const journeyId = getJourneyId ? getJourneyId() : null;
		if (journeyId && typeof $ !== 'undefined') {
			$(fieldSelector).val(journeyId);
		}
	}

	return {
		appSettings,
		COUNTRY_NAME_MAP,
		// URL utilities
		getParameterByName,
		queryParamFromObject,
		// Server routing
		getServerUrl,
		getBaseRedirectUrl,
		isEuCountry,
		// Auth redirect
		getLocalizedRedirectPath,
		buildRedirectUrl,
		executeRedirect,
		// Country/region handling
		getHomeCountry,
		handleCountryChange,
		handleReferralSourceDropdown,
		updateRegionalDropdownOptions,
		// Utilities
		waitForGlobalObject,
		generateUniqueID,
		captureJourneyId,
	};
})();

export { landingPageModule };
