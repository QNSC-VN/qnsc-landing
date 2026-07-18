# Changelog

## [0.1.1](https://github.com/QNSC-VN/qnsc-landing/compare/qnsc-landingv0.1.0...qnsc-landingv0.1.1) (2026-07-18)


### ✨ Features

* **contact:** honeypot + Turnstile bot protection ([#19](https://github.com/QNSC-VN/qnsc-landing/issues/19)) ([85518b9](https://github.com/QNSC-VN/qnsc-landing/commit/85518b94bdd77d1b2429f5a09a9611a04ff1498e))
* migrate landing page to Astro with EN/VI i18n, CI/CD, and AWS infra ([a628aab](https://github.com/QNSC-VN/qnsc-landing/commit/a628aab64e09f1ccf081b2b336d3d7fe9a1771c1))


### 🐛 Bug Fixes

* **contact:** render Turnstile unconditionally so eslint can parse it ([#21](https://github.com/QNSC-VN/qnsc-landing/issues/21)) ([6b875be](https://github.com/QNSC-VN/qnsc-landing/commit/6b875be03131874518ac96a80da18f46a220570f))
* **deps:** pin typescript to ^6 (eslint toolchain compat) ([3af4988](https://github.com/QNSC-VN/qnsc-landing/commit/3af498825308870606ee8cd5761a315294b23a5a))
* **deps:** pin typescript to ^6 (typescript-eslint 8.x incompatible with TS 7) ([6a0f3bb](https://github.com/QNSC-VN/qnsc-landing/commit/6a0f3bb6b9c5c2f352293c89a43c501a72904f2d))
* **deps:** pin typescript to ~6.0.3 for typescript-eslint compat ([#20](https://github.com/QNSC-VN/qnsc-landing/issues/20)) ([272cfa3](https://github.com/QNSC-VN/qnsc-landing/commit/272cfa3704d4b2e3c75d7d1a9b2694220cdef4eb))
* navbar gradient scrim still let text bleed through, make it solid ([4a29198](https://github.com/QNSC-VN/qnsc-landing/commit/4a2919830e7200bbd8ac54352f3b5fe114d5cde9))
* navbar has no background before scroll, hero text bleeds through nav ([f2e27dc](https://github.com/QNSC-VN/qnsc-landing/commit/f2e27dcb35b102f126da2d44a0cfe42c06b3d063))
* remove em-dashes and generic placeholder name from visible copy ([1435299](https://github.com/QNSC-VN/qnsc-landing/commit/1435299d4c5b933a6e73ceacf7d43d5325ecb734))


### ♻️ Refactors

* extract Card and Badge primitives ([cfb9040](https://github.com/QNSC-VN/qnsc-landing/commit/cfb9040358db21b7e135392ff52edc1e5a76b5fa))
* migrate hosting to Cloudflare Pages, fix UX/SEO bugs ([6815e37](https://github.com/QNSC-VN/qnsc-landing/commit/6815e37518d92ff4a9faa42454393450faca92d9))
* unify leadership card system into one component ([aa9da64](https://github.com/QNSC-VN/qnsc-landing/commit/aa9da64aaf2d89673a1de8ed5ac52bfc54260b22))


### 📦 Dependencies

* bump astro in the production-dependencies group ([#8](https://github.com/QNSC-VN/qnsc-landing/issues/8)) ([2f9fd24](https://github.com/QNSC-VN/qnsc-landing/commit/2f9fd2429b350493b12e092b8cc62ce593e9c46b))
* bump the development-dependencies group across 1 directory with 5 updates ([#9](https://github.com/QNSC-VN/qnsc-landing/issues/9)) ([5f9238e](https://github.com/QNSC-VN/qnsc-landing/commit/5f9238e96f053b36863c6928709580cb7a60a59e))
* bump the development-dependencies group with 7 updates ([#15](https://github.com/QNSC-VN/qnsc-landing/issues/15)) ([f5e0b82](https://github.com/QNSC-VN/qnsc-landing/commit/f5e0b82f0834345135b812dac6e0a5a326a277d2))
