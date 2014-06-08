webGL ModelViewer
=================

This is a simple model viewer rendered with webGL without using the three.js library.

IMPORTANT: If you just see a yellow screen you may need to wait for meshes and textures to load to show up. It can happen that meshes load first ands see black figures, keep waiting for the textures to load so you can see it correctly. I may set a loading state some time.

Description
-----------

In this scene we can see two elements loaded from an .obj file. The first element is a Troll which has a diffuse, a specular, a normal map (no tangents calculated), and a mask that is used so we do not apply specularity to the Troll's skin.
The second element is a ball that is modified by its vertex shader. We set a random number for each vertex, and that number is their offset. We then calculate the vertex position interpolating between a min position and a max position (depending on time and the Sin function), and using the vertex normal as its direction.

Controls
--------
- You can move the camera with W, A, S, D and rotate it with I, J, K, L 
- The elements can be rotated with the arrow keys ← and →. 
- The movement and rotation speed can be changed with the arrow keys ↑ (to raise) and ↓ (to lower).
 
How to see it
-------------

You need xampp or similar to run this project in local, or upload it to the internet. You can also watch it through this link, but I may remove it some day:


https://dl.dropboxusercontent.com/u/68958924/index.html

Libraries
---------

I use:

- webgl-utils.js
- glMatrix-0.9.5.min.js
- The obj-loader from this git: https://github.com/frenchtoast747/webgl-obj-loader

