## 1 Introduction to Image Segmentation


### 1.1 Computer vision

Hugging Face divides computer vision into 16 tasks. Three of the most fundamental are image classification, object detection, and image segmentation. This article focuses on segmentation.

![image.png](/blogs/mask2former/b5ea5fd4-25c2-4ab2-97d4-1cedb0317e4b.png?w=528)


[Image classification](https://huggingface.co/tasks/image-classification)

Image classification assigns one or more categories to an entire image. The model outputs category labels describing the image.

![image.png](/blogs/mask2former/81230a66-df75-496f-b2bb-d32257865f15.png?w=384)

[Object detection](https://huggingface.co/tasks/object-detection)

Object detection locates and marks objects of interest in an image. The output contains a category and a bounding box for each object.



![image.png](/blogs/mask2former/92edc04c-747b-4ade-96ee-bcd221485c12.png?w=384)

[Image segmentation](https://huggingface.co/tasks/image-segmentation)

Image segmentation divides an image into regions, each corresponding to a particular category.


![image.png](/blogs/mask2former/42b8ae6a-7268-4f74-9178-9519d2ad8f94.png?w=384)



### 1.2 Image segmentation

There are three principal forms: semantic segmentation, instance segmentation, and panoptic segmentation.

![image.png](/blogs/mask2former/e96cd9e5-c61c-4fb1-833f-cb15e8d69a3a.png?full=1)

| **Semantic segmentation** | **Instance segmentation** | **Panoptic segmentation** |
| --- | --- | --- |
| **Definition:** Assign a class to every pixel, without distinguishing individual objects of the same class. | **Definition:** Classify every pixel and distinguish individual objects within the same class, combining object detection with semantic segmentation. | **Definition:** Combine semantic and instance segmentation. Every pixel has a unique assignment to either a particular object instance or a background category such as sky or road. |
| **Characteristics:**<br>• Every pixel has a class label.<br>• Pixels of the same class share a label.<br>• Instances of the same class are not distinguished. | **Characteristics:**<br>• Every pixel has a class label.<br>• Different instances receive separate labels or masks.<br>• Both category and instance identity are recognized. | **Characteristics:**<br>• Every pixel has a class label.<br>• Instances receive separate labels or masks.<br>• Both thing classes, such as people and cars, and stuff classes, such as sky and road, are handled. |
| **Applications:**<br>• Roads and lanes in autonomous driving.<br>• Organs and lesions in medical images. | **Applications:**<br>• Pedestrians and vehicles in autonomous driving.<br>• Grasping and manipulating objects in robotics. | **Applications:**<br>• Advanced scene understanding, including panoramic perception for autonomous driving.<br>• Video analysis and robot navigation. |
| **Example:** All pixels belonging to people are labeled as people, without identifying each person. | **Example:** Every person has a separate segmentation mask, in addition to the person label. | **Example:** Each person is distinguished individually, while background regions such as roads and buildings are also labeled. |


### 1.3 Classic segmentation models

| Model | Authors | Year | Description |
| --- | --- | --- | --- |
| FCN | UC Berkeley | 2015 | The first model to apply a fully convolutional neural network to segmentation. Replacing fully connected layers with convolutional layers allows inputs of arbitrary size. |
| U-Net | University of Freiburg, Germany | 2015 | Originally designed for biomedical segmentation, U-Net performs well across a wide range of segmentation tasks. |
| DeepLab family | Google | 2016 | Atrous convolution and atrous spatial pyramid pooling (ASPP) capture multi-scale context. DeepLabv3+ also incorporates an encoder–decoder architecture. |
| Mask R-CNN | Meta | 2017 | Performs object detection and instance segmentation. It extends Faster R-CNN with a branch that predicts a mask for each detected object. |
| SOLO family | University of Adelaide / ByteDance | 2019 | Recasts instance segmentation as location classification, simplifying the pipeline and achieving strong benchmark results. |
| MaskFormer family | Meta | 2021 | Transformer modules and dynamic mask prediction provide a unified and efficient segmentation approach. |


### 1.4 Classic training datasets

| Dataset | Description | Size |
| --- | --- | --- |
| COCO | A large-scale dataset for object detection, segmentation, keypoints, and image captioning, consisting of 328K images. | About 330,000 images / 200,000 annotated / 80 categories / more than 1.5 million instances |
| ADE20K | More than 20K scene-centered images with detailed pixel-level object and part annotations. Its 150 categories cover both stuff such as sky, road, and grass, and objects such as people, cars, and beds. | 25,000 images / 150 semantic categories |
| Cityscapes | An urban street-scene database with semantic, instance, and dense pixel annotations for 30 classes in eight groups: flat surfaces, humans, vehicles, construction, objects, nature, sky, and void. It contains about 5,000 fine and 20,000 coarse annotations. | 5,000 finely annotated images / 20,000 coarsely annotated images / 30 classes / collected in Germany using vehicle-mounted cameras |


### 1.5 The effect of different pretraining datasets

Results differ across pretraining datasets, mainly because of:

- Data quality and volume.
- How well the dataset's subject matter matches the target application.
The following comparison uses Mask2Former.

| Original image | COCO (panoptic) | ADE20K (semantic) | Cityscapes (semantic) | Mapillary Vistas (semantic) |
| --- | --- | --- | --- | --- |
| | Insufficient segmentation detail | Limited road-surface detail | Limited road-surface detail | Details such as lane markings and white outlines |
| ![](/blogs/mask2former/b5dbd972-1d48-4a84-943e-e74058bc8648.png?w=280) | ![](/blogs/mask2former/074f3a0f-779e-4921-ab9c-50c5bb25124a.png?w=280) | ![](/blogs/mask2former/b4b7b11f-b04c-444e-b97c-2571fd74ec4f.png?w=280) | ![](/blogs/mask2former/d2945318-420d-4c40-b5b5-04f08d3b46a9.png?w=280) | ![](/blogs/mask2former/2b0d1e29-9171-4f9d-8781-2ad6e57829ef.png?w=280) |
| ![](/blogs/mask2former/3207a5a8-d0ec-482f-a9a6-b673b13b3c67.png?w=280) | ![](/blogs/mask2former/12b182b3-9f5a-41a9-b5a3-88777d62015d.png?w=280) | ![](/blogs/mask2former/7d08f244-2d8c-4978-a881-ad60df67cce3.png?w=280) | ![](/blogs/mask2former/54348bc3-cc4e-467d-a23d-997a73768d84.png?w=280) | ![](/blogs/mask2former/e6925d2d-3ff7-4fce-bdec-f6d05ea74f63.png?w=280) |
| ![](/blogs/mask2former/62bbf8fb-46b1-45c9-b414-9c42939ed0ac.png?w=280) | ![](/blogs/mask2former/9efafff7-8c3b-42a6-a6ed-3a0e5f1ae6b2.png?w=280) | ![](/blogs/mask2former/4e39063a-68cc-42a2-be4b-9e758bf408f7.png?w=280) | ![](/blogs/mask2former/99f0f58c-d037-4368-9bf6-78d16745c8c8.png?w=280) | ![](/blogs/mask2former/67c2deb2-8f4c-4540-9e0e-63facdd08d5b.png?w=280) |
| ![](/blogs/mask2former/041efdfc-24d7-4e5d-85f7-0f5c08bf5f97.png?w=280) | ![](/blogs/mask2former/2011b4ce-816d-4451-a956-4fd9555ff177.png?w=280) | ![](/blogs/mask2former/99ac9bc6-e1be-41c6-a5b3-8c446b186d9f.png?w=280) | ![](/blogs/mask2former/2949b2ed-e593-4734-9b3b-49f3ce311677.png?w=280) | ![](/blogs/mask2former/f3a69799-d936-470a-b101-536e5d835770.png?w=280) |



## 2 The Mask2Former Family of Papers


### 2.1 Introduction

Earlier object detectors such as R-CNN and YOLO first propose boxes or partition the image into broad regions. Segmentation methods, meanwhile, are typically formulated as per-pixel classification.

| Region proposals in R-CNN | Grids in YOLO | FCN | DeepLab |
| --- | --- | --- | --- |
| ![](/blogs/mask2former/0d3d02ba-b2bf-4fce-a142-7d8d3886cfc9.png?w=220) | ![](/blogs/mask2former/c63c0abd-9a42-471d-9fa3-c40dacefa99a.png?w=220) | ![](/blogs/mask2former/a8d426f1-7334-4d56-958b-544e6487c590.png?w=220) | ![](/blogs/mask2former/f776b79c-22a1-4635-a036-9ebb935c8764.png?w=220) |
| Region proposals, region features, classification, and box regression | Image partitioning, box prediction, and class prediction | | |


### 2.2 DETR (2020)

>

Core innovation:

- Object queries directly produce detection boxes, removing the need to supply candidate boxes.
![image.png](/blogs/mask2former/1b805dee-ef06-4a3c-9924-6b636039c3b2.png?full=1)

>

Model overview

1. A CNN such as ResNet50 or ResNet101 extracts features, reducing spatial size and increasing channels to (2048, W/32, H/32).
1. A 1×1 convolution reduces channels, and the result is reshaped into a sequence of shape d (256) × HW.
1. Positional embeddings are computed from x and y coordinates using trigonometric functions, as in a Transformer.
1. Image features and positional embeddings enter the encoder.
1. Generate N trainable object queries, with N much larger than the expected number of objects: 100 queries initialized with torch.rand(100, 256).
1. Queries enter a standard, unmasked, non-autoregressive Transformer decoder, producing N outputs.
1. Self-attention between object queries enables communication and reduces duplicate predictions.
1. One FFN predicts object classes, including an empty class; another predicts box position and size: center, width, and height.
1. Hungarian matching pairs the unordered N predictions with the n ground-truth boxes to minimize total matching cost. Unmatched predictions receive the empty class.
1. Compute the model loss from these matches:
  1. Loss = classification error + bounding-box error.
![image.png](/blogs/mask2former/941f38b9-8eba-43f5-9673-a62063561dcf.png?w=288)

  1. Bounding-box error = box-center distance + box IoU.
![image.png](/blogs/mask2former/02b85bf5-4995-4af0-aba8-cd407d204f3a.png?w=240)


Limitations: slow training and inference. DETR identifies objects well, but performs less well on small objects because Transformers emphasize global features.


As training progresses, the boxes produced by object queries move closer to the ground truth.

Because of Hungarian matching, the query responsible for a particular object can change during training.

[video] citadelattachment-1805501192596934668.mp4
[video] citadelattachment-1805501194878935072.mp4
Transformer encoder attention visualization

Each point pays more attention to its corresponding object as a whole.

![image.png](/blogs/mask2former/ed17bb95-d7cf-4456-b808-b392571bc745.png?full=1)

Transformer decoder attention visualization

Each box pays more attention to object boundaries.

![image.png](/blogs/mask2former/f4dc4cc3-bb8b-43c2-a27f-b4e7cbb98e18.png?w=336)

Object-query visualization: green denotes small boxes, red large horizontal boxes, and blue large vertical boxes. Each query has its own spatial preferences, while all tend to attend to larger central objects.

These 100 queries are like 100 people, each looking at different areas.

![image.png](/blogs/mask2former/52a5bb38-c852-4a4d-94f3-40f77835a181.png?w=864)


>

Paper: [https://arxiv.org/abs/2005.12872](https://arxiv.org/abs/2005.12872)

References:

- [Zhihu: DETR for Transformer-based object detection](https://zhuanlan.zhihu.com/p/387102036)
- [Bilibili: A brief analysis of DETR: End-to-End Object Detection with Transformers [2005.12872]](https://www.bilibili.com/video/BV1T64y1D7NY/)
- [Bilibili: A close reading of the DETR paper](https://www.bilibili.com/video/BV1GB4y1X72R)
- [Zhihu: Visualizing object-query matching to ground truth during DETR training](https://zhuanlan.zhihu.com/p/592381828)



### 2.3 MaskFormer (2021)

>

Core innovation:

- Generate masks for categories rather than predicting a category independently for every pixel.
![image.png](/blogs/mask2former/f1556fb5-18f4-48de-9904-85c199b70ef7.png?full=1)


![image.png](/blogs/mask2former/bcf5355b-20ac-4620-8a9a-629f29032846.png?w=432)

>

Model overview

1. A CNN backbone such as ResNet50, ResNet101, or Swin Transformer extracts lower-resolution, higher-channel features.
1. A pixel decoder based on a feature pyramid network gradually upsamples to the original H and W, producing 256-dimensional pixel embeddings.
1. Generate N trainable queries, far more than the expected number of objects, as in DETR.
1. Queries enter a Transformer decoder using image features for multi-head attention keys and values, producing N outputs.
1. An MLP and softmax convert these outputs into N class predictions.
1. Another MLP converts them into N 256-dimensional mask embeddings.
1. Dot products between mask and pixel embeddings, followed by sigmoid, produce N masks with values between 0 and 1.
1. Combine masks with class predictions to obtain a classification mask for each of K classes.
1. For semantic segmentation, the categories are fixed, so pixel-based loss can be computed without bipartite matching. The paper notes that matching can still improve results.
  1. Loss = classification loss + mask loss, as in DETR.
1. Other tasks such as instance segmentation still require bipartite matching. MaskFormer's instance and panoptic results are not as strong as its semantic results, a point discussed by Mask2Former.

Limitations: slow training and inference, high GPU-memory use, and weaker instance and panoptic segmentation than semantic segmentation.

Semantic and instance segmentation examples illustrate MaskFormer's performance across different tasks.

![image.png](/blogs/mask2former/376b4026-e4c0-4829-8751-58bdc837949c.png?w=576)

>

Paper: [https://arxiv.org/abs/2107.06278](https://arxiv.org/abs/2107.06278)

References:

- [Bilibili: Per-Pixel Classification is Not All You Need for Semantic Segmentation [2107.06278]](https://www.bilibili.com/video/BV17f4y1A7XR/)



### 2.4 Mask2Former (2021)

>

Core innovations:

- Modify the Transformer decoder by adding masked attention.
- Use a feature-pyramid structure inside the Transformer decoder.
![image.png](/blogs/mask2former/afb03827-be46-4e5c-a61f-10e31183799b.png?w=384)

>

Model overview

1. Global cross-attention converges slowly and needs considerable training to focus on local object regions. Masked attention restricts cross-attention to foreground regions while retaining the standard residual cross-attention structure.
  1. Original attention:
![image.png](/blogs/mask2former/8b985dab-1b07-4612-bf1c-6c4518a4b2db.png?w=192)

  1. Modified attention:
![image.png](/blogs/mask2former/a9f081ad-92a1-4eb0-871d-16686c7e9956.png?w=288)

  1. Where:
![image.png](/blogs/mask2former/60226e96-f338-4f68-96dd-39e1cf57c251.png?w=240)

M_{l-1}(x,y) is the mask prediction from the previous decoder layer.

1. The decoder contains L three-layer blocks. Each layer uses keys and values from pixel-decoder image features at a different scale.
1. Masked attention comes before self-attention in the decoder.
1. Loss is evaluated on randomly sampled points rather than the entire image.

Evaluation results

Panoptic segmentation

![image.png](/blogs/mask2former/092f6ee7-157e-418f-887f-6a6b99c2133e.png?full=1)

Instance segmentation

![image.png](/blogs/mask2former/9bfcce90-be11-45e9-acce-640d96bcf992.png?full=1)

Semantic segmentation

![image.png](/blogs/mask2former/bc116231-b2ef-4cdd-8956-c3c3c611a734.png?w=288)

The same four queries tend to attend to relatively consistent locations across images, effectively serving as region proposals.

![image.png](/blogs/mask2former/1f522e7b-29e5-47af-8b4b-36d02c9fab41.png?w=384)

>

Paper: [https://arxiv.org/abs/2112.01527](https://arxiv.org/abs/2112.01527)

References:

- [Bilibili: Masked-attention Mask Transformer for Universal Image Segmentation [2112.01527]](https://www.bilibili.com/video/BV1ob4y1B7hp/)
