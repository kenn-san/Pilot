#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler; //16x16x16 for lut_01~lut_06

layout(location = 0) out highp vec4 out_color;

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0); 
    highp float _COLORS      = float(lut_tex_size.y);
    highp vec4 color         = subpassLoad(in_color).rgba; //value of in_color

    //Tramsform rgb
    highp float red = color[0];
    highp float green = color[1];
    highp float blue = color[2];

    highp float transformed_blue = color[2]*(_COLORS-1.5f) + 0.5f;
    highp float floor_blue = floor(transformed_blue);
    highp float ceil_blue = ceil(transformed_blue);

    highp vec2 uv1; // sample position 1
    uv1[0] = (floor_blue*_COLORS + red*_COLORS)/float(lut_tex_size.x);
    uv1[1] = green*_COLORS/float(lut_tex_size.y);
    highp float weight1 = (1.0f - transformed_blue + floor_blue);

    highp vec2 uv2; // sample position 2
    uv2[0] = (ceil_blue*_COLORS + red*_COLORS)/float(lut_tex_size.x);
    uv2[1] = green*_COLORS/float(lut_tex_size.y);
    highp float weight2 = (1.0f - ceil_blue + transformed_blue);

    highp vec4 sampled_color;
    sampled_color = weight1*texture(color_grading_lut_texture_sampler, uv1) + weight2*texture(color_grading_lut_texture_sampler, uv2); // referenced color 
    //sampled_color = texture(color_grading_lut_texture_sampler, uv1);
    out_color = sampled_color;
    //out_color = color;
}
