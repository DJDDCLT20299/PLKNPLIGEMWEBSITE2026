# Background Animation Update

## Summary
Successfully updated the home page background animation with an enhanced particle system featuring wandering lanmodulin and terbium particles that merge and separate in a continuous loop.

## Changes Made

### 1. New Particle Animation System (`js/particle-animation.js`)
Created a completely new animation system with the following features:

#### Particle Types
- **Lanmodulin particles**: Using images `2.png` and `Untitled design (1).png`
- **Terbium particles**: Using images `3.png` and `Untitled design (2).png`

#### Animation Behavior
1. **Wandering Motion**: Particles move naturally across the screen with smooth wandering behavior
   - Each particle has its own wandering angle and speed
   - Velocities smoothly interpolate for organic movement
   - Particles wrap around screen edges for seamless looping

2. **Collision & Merging**: 
   - When lanmodulin and terbium particles collide (within 70px distance), they merge
   - Merged particles display both images overlapped with enhanced glow effects
   - Collision detection only occurs between different particle types

3. **Random Separation**:
   - Merged particles have a random lifetime (120-300 frames)
   - After the lifetime expires, they separate back into individual particles
   - Separation creates two new particles that fly apart in opposite directions
   - Each separated particle retains its original type and properties

4. **Loop Reaction**:
   - The merge → separate cycle continues indefinitely
   - New particles can merge again, creating a perpetual loop
   - 20 lanmodulin particles + 20 terbium particles = dynamic ecosystem

#### Visual Effects
- **Glow Effects**: Pulsating glows around all particles (enhanced for merged particles)
- **Rotation**: Each particle rotates at its own speed
- **Alpha Blending**: Semi-transparent rendering for ethereal look
- **Size Variation**: Particles have randomized sizes (30-60px)
- **Merged State**: Bright white core with overlapped images

### 2. Updated `index.html`
- Replaced the old inline animation script with external file reference
- Maintained the full-page hero section (100vh)
- Canvas already configured to cover entire hero section
- Background styling unchanged (gradient with gray tones)

### 3. Images Used
All images are located in `assets/images/`:
- `2.png` (36KB) - Lanmodulin variant 1
- `3.png` (44KB) - Terbium variant 1  
- `Untitled design (1).png` (45KB) - Lanmodulin variant 2
- `Untitled design (2).png` (98KB) - Terbium variant 2

## Technical Details

### Performance
- Asynchronous image loading with fallback to colored circles
- RequestAnimationFrame for smooth 60fps animation
- Efficient collision detection (only checks different particle types)
- Canvas clears and redraws each frame

### Responsive Design
- Automatically resizes with window
- Particles repositioned on window resize
- Works on all screen sizes

### Browser Compatibility
- Uses standard Canvas 2D API
- No WebGL or advanced features required
- Fallback rendering if images fail to load

## How It Works

1. **Initialization**: Images load asynchronously, then scene initializes with 40 total particles
2. **Update Loop**: Each frame updates particle positions, checks collisions, manages merged particles
3. **Render Loop**: Draws all particles with glow effects and rotations
4. **Continuous Cycle**: Particles wander → collide → merge → separate → repeat

## Result
A dynamic, organic background animation that visualizes the lanmodulin-terbium binding and release cycle in a visually engaging way. The animation creates a sense of biological activity and scientific process while maintaining the site's aesthetic.
