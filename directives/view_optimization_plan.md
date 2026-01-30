# View Experience Optimization: Preload Next Slide

## Goal
Improve the viewing experience by eagerly preloading the content of the next slide(s) so the user doesn't see a placeholder or loading state when navigating forward.

## Current State
- `SwiperComponent.vue` uses `IntersectionObserver` with `rootMargin: '50% 0px'`.
- Images are only loaded (`isVisible` becomes true) when they are close to the viewport.
- This effectively loads the next slide only when the user *starts* to navigate or is very close.

## Proposed Changes

### [SwiperComponent.vue](file:///home/jack/git/antigravity/slide-flow/src/components/SwiperComponent.vue)

1.  **Implement `preloadNext` function**:
    -   When `activeIndex` updates, immediately set `isVisible[activeIndex + 1] = true`.
    -   Optionally preload `activeIndex + 2` for smoother fast navigation.
    -   Also ensure `isVisible[activeIndex]` is true (sanity check).

2.  **Logic**:
    -   Watch `activeIndex`.
    -   On change:
        ```javascript
        const preloadCount = 3; // Preload next 3 slides
        for (let i = 1; i <= preloadCount; i++) {
            if (activeIdx + i < props.slides.length) {
                isVisible.value[activeIdx + i] = true;
            }
        }
        ```

3.  **Refinement**:
    -   Keep `IntersectionObserver` for random access or initial hydration.
    -   Ensure `loaded` state is handled correctly.

## Verification Plan

### Manual Verification
1.  Open the Network tab in Browser DevTools.
2.  Navigate to a slide.
3.  Observe that the *next* slide's image request is fired immediately, before navigating to it.
4.  Disconnect network (Offline mode) and verify the next slide is available.
