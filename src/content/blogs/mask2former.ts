export const body = `## 1 图像分割简介


### 1.1 计算机视觉

Hugging Face 将计算机视觉分成16个task， 其中最基础且核心的三个方向，也就是图像分类、目标检测和图像分割。我们这次主要关注在图像分割方向。

![image.png](/blogs/mask2former/b5ea5fd4-25c2-4ab2-97d4-1cedb0317e4b.png?w=528)


[图像分类](https://huggingface.co/tasks/image-classification)

图像分类是指将整个图像分配到一个或多个类别中的任务。模型的输出是一个或多个类别标签，表示图像所属的类别。

![image.png](/blogs/mask2former/81230a66-df75-496f-b2bb-d32257865f15.png?w=384)

[目标检测](https://huggingface.co/tasks/object-detection)

目标检测是指在图像中找到并标记出所有感兴趣的物体。模型的输出包括每个物体的类别标签和边界框（bounding box），表示物体的位置。



![image.png](/blogs/mask2former/92edc04c-747b-4ade-96ee-bcd221485c12.png?w=384)

[图像分割](https://huggingface.co/tasks/image-segmentation)

图像分割是指将图像划分为多个区域，每个区域对应一个特定的类别。


![image.png](/blogs/mask2former/42b8ae6a-7268-4f74-9178-9519d2ad8f94.png?w=384)



### 1.2 图像分割

图像分割具体细分也可以分成3种形式：语义分割、实例分割、全景分割。

![image.png](/blogs/mask2former/e96cd9e5-c61c-4fb1-833f-cb15e8d69a3a.png?full=1)

| **Semantic Segmentation**<br>语义分割 | **Instance Segmentation**<br>实例分割 | **Panoptic Segmentation**<br>全景分割 |
| --- | --- | --- |
| **定义**：语义分割的目标是将图像中的每个像素分类为特定的类别。换句话说，它为图像中的每个像素分配一个类别标签，但不区分同一类别的不同实例。 | **定义**：实例分割的目标是不仅要将图像中的每个像素分类为特定的类别，还要区分同一类别的不同实例。它结合了物体检测和语义分割的任务。 | **定义**：全景分割的目标是结合语义分割和实例分割的优点，将图像中的每个像素分类为特定的类别，同时区分同一类别的不同实例。全景分割需要对每个像素进行唯一标识，确保每个像素要么属于一个具体的物体实例，要么属于一个背景类（如天空、道路等）。 |
| **特点**：<br>• 每个像素都有一个类别标签。<br>• 同一类别的所有像素被分配相同的标签。<br>• 不区分同一类别的不同实例。 | **特点**：<br>• 每个像素都有一个类别标签。<br>• 同一类别的不同实例会被分配不同的标签或掩码。<br>• 既要识别类别，又要区分同一类别的不同实例。 | **特点**：<br>• 每个像素都有一个类别标签。<br>• 同一类别的不同实例会被分配不同的标签或掩码。<br>• 同时处理"东西类"（thing classes，如人、车等）和"背景类"（stuff classes，如天空、道路等）。 |
| **应用**：<br>• 自动驾驶中的道路和车道检测。<br>• 医学影像中的器官和病变区域分割。 | **应用**：<br>• 自动驾驶中的行人和车辆检测。<br>• 机器人视觉中的物体抓取和操作。 | **应用**：<br>• 高级场景理解，如自动驾驶中的全景感知。<br>• 视频分析和机器人导航。 |
| **示例**：在一张包含多个人的图像中，所有属于"人"的像素都会被标记为"人"，而不区分具体是哪个人。 | **示例**：在一张包含多个人的图像中，不仅要标记所有"人"的像素，还要区分具体是哪个人，即每个人都有一个独立的分割掩码。 | **示例**：在一张包含多个人和背景（如道路、建筑物等）的图像中，不仅要标记每个人的像素并区分具体是哪个人，还要标记背景区域如道路和建筑物。 |


### 1.3 经典图像分割模型

| 名称 | 作者 | 年份 | 介绍 |
| --- | --- | --- | --- |
| FCN | UC Berkeley | 2015 | FCN 是第一个将卷积神经网络（CNN）完全应用于图像分割任务的模型。它通过将全连接层替换为卷积层，使得模型能够处理任意大小的输入图像。 |
| U-Net | 德国弗莱堡大学 | 2015 | U-Net 最初是为生物医学图像分割设计的，但它在各种图像分割任务中表现出色。 |
| DeepLab 系列 | Google | 2016 | DeepLab 系列模型通过引入空洞卷积（Atrous Convolution）和空间金字塔池化（ASPP）等技术，有效地捕捉多尺度上下文信息。DeepLabv3+ 进一步结合了编码器-解码器结构。 |
| Mask R-CNN | Meta | 2017 | Mask R-CNN 是一种同时进行目标检测和实例分割的模型。它在 Faster R-CNN 的基础上增加了一个分支，用于预测每个检测到的目标的分割掩码。 |
| SOLO 系列 | 阿德莱德大学 / 字节跳动 | 2019 | SOLO 系列模型通过将实例分割问题转化为位置分类问题，简化了实例分割的流程，并在多个基准测试中取得了优异的性能。 |
| MaskFormer 系列 | Meta | 2021 | MaskFormer 系列通过引入 Transformer 模块和动态掩码预测机制，提供了一种统一且高效的分割解决方案。 |


### 1.4 经典训练数据集

| 数据集名称 | 介绍 | 数据量 |
| --- | --- | --- |
| COCO | MS COCO 数据集是一个大规模对目标检测、分割、关键点检测和图像描述数据集。数据集由 328K 张图像组成。 | 33 万张图片 / 20 万张有标注 / 80 类类别 / 超过 150 万个个体数据 |
| ADE20K | ADE20K 语义分割数据集包含超过 20K 个以场景为中心的图像，这些图像使用像素级对象和对象部件标签进行了详尽的注释。总共有 150 个语义类别，包括天空、道路、草地等事物，以及人、车、床等离散对象。 | 25000 张照片 / 150 个语义类别 |
| Cityscapes | Cityscapes 是一个大型数据库，专注于对城市街景的语义理解。它为 30 个类提供语义、实例和密集像素注释，这些类分为 8 个类别（平面、人、车辆、建筑、对象、自然、天空和虚空）。该数据集由大约 5000 张精细注释图像和 20000 张粗标图像组成。 | 5000 张精标图片 / 20000 张粗标图片 / 30 个语义类别 / 采集地：德国 / 采集方式：车载相机 |


### 1.5 不同预训练数据集训练出的效果

不同预训练数据集训练出的效果是不一样的，主要取决于：

- 数据集自身的数据质量、数据量
- 数据集的主题/内容与目标应用场景的匹配程度
以下比较比Mask2Former模型为例

| 原图 | COCO（Panoptic） | ADE20K（Semantic） | Cityscape（Semantic） | Mapiliary Vistas（Semantic） |
| --- | --- | --- | --- | --- |
|  | 分割精细度不足 | 路面细节不够 | 路面细节不够 | 车道线、白线框等细节 |
| ![](/blogs/mask2former/b5dbd972-1d48-4a84-943e-e74058bc8648.png?w=280) | ![](/blogs/mask2former/074f3a0f-779e-4921-ab9c-50c5bb25124a.png?w=280) | ![](/blogs/mask2former/b4b7b11f-b04c-444e-b97c-2571fd74ec4f.png?w=280) | ![](/blogs/mask2former/d2945318-420d-4c40-b5b5-04f08d3b46a9.png?w=280) | ![](/blogs/mask2former/2b0d1e29-9171-4f9d-8781-2ad6e57829ef.png?w=280) |
| ![](/blogs/mask2former/3207a5a8-d0ec-482f-a9a6-b673b13b3c67.png?w=280) | ![](/blogs/mask2former/12b182b3-9f5a-41a9-b5a3-88777d62015d.png?w=280) | ![](/blogs/mask2former/7d08f244-2d8c-4978-a881-ad60df67cce3.png?w=280) | ![](/blogs/mask2former/54348bc3-cc4e-467d-a23d-997a73768d84.png?w=280) | ![](/blogs/mask2former/e6925d2d-3ff7-4fce-bdec-f6d05ea74f63.png?w=280) |
| ![](/blogs/mask2former/62bbf8fb-46b1-45c9-b414-9c42939ed0ac.png?w=280) | ![](/blogs/mask2former/9efafff7-8c3b-42a6-a6ed-3a0e5f1ae6b2.png?w=280) | ![](/blogs/mask2former/4e39063a-68cc-42a2-be4b-9e758bf408f7.png?w=280) | ![](/blogs/mask2former/99f0f58c-d037-4368-9bf6-78d16745c8c8.png?w=280) | ![](/blogs/mask2former/67c2deb2-8f4c-4540-9e0e-63facdd08d5b.png?w=280) |
| ![](/blogs/mask2former/041efdfc-24d7-4e5d-85f7-0f5c08bf5f97.png?w=280) | ![](/blogs/mask2former/2011b4ce-816d-4451-a956-4fd9555ff177.png?w=280) | ![](/blogs/mask2former/99ac9bc6-e1be-41c6-a5b3-8c446b186d9f.png?w=280) | ![](/blogs/mask2former/2949b2ed-e593-4734-9b3b-49f3ce311677.png?w=280) | ![](/blogs/mask2former/f3a69799-d936-470a-b101-536e5d835770.png?w=280) |



## 2 Mask2Former系列论文


### 2.1 引入

之前的目标检测方法，都是需要先通过一共的方式给出框，或者划分一个大致的范围。例如RCNN和YOLO。而图像分割方法，几乎都是定义为为对每一个像素做分类预测。

| RCNN中的region proposal | YOLO中的grid | FCN | DeepLab |
| --- | --- | --- | --- |
| ![](/blogs/mask2former/0d3d02ba-b2bf-4fce-a142-7d8d3886cfc9.png?w=220) | ![](/blogs/mask2former/c63c0abd-9a42-471d-9fa3-c40dacefa99a.png?w=220) | ![](/blogs/mask2former/a8d426f1-7334-4d56-958b-544e6487c590.png?w=220) | ![](/blogs/mask2former/f776b79c-22a1-4635-a036-9ebb935c8764.png?w=220) |
| 区域提案、候选区特征提取、类别分类、边界框回归 | 图像划分、边界框预测、类别预测 |  |  |


### 2.2 DETR（2020）

> 

核心创新：

- 提出了object query的方法，直接输出检测框，避免了提供备选框。
![image.png](/blogs/mask2former/1b805dee-ef06-4a3c-9924-6b636039c3b2.png?full=1)

> 

模型总结

1. 图片经过CNN（Resnet50、Resnet101）做特征提取，缩小面积，增多通道数。（2048, W/32, H/32）
1. 使用1×1卷积将图片通道数减少，且reshape成一个序列数据，形状为 d（256）×HW。
1. 根据x轴和y轴坐标，计算position embedding（与Transformer类似的三角函数方法）。
1. 图片加position embedding进入encoder。
1. 生成N个可训练的object query（N远大于图中可能的物体数（100）），可学习的，初始化为随机 torch.rand(100, 256)）。
1. 以object query为输入，进入decoder（standard transformer decode，没有masked，非自回归），输出N个结果。
1. object_query之间会有自注意层，有助于相互之间通信，减少重复。
1. N个结果经过一个FFN输出物体的类别预测（有一个类别是空），再经过另一FFN输出目标框的位置和大小（中心点+宽+高）。
1. 使用匈牙利匹配算法将无序的N个预测与真实的n个物体框做匹配，使得整体的匹配误差（同Loss）最小。多出的预测结果设置分类为空。
1. 根据匹配结果，计算模型Loss：
  1. Loss = 分类误差 + 目标框误差
![image.png](/blogs/mask2former/941f38b9-8eba-43f5-9673-a62063561dcf.png?w=288)

  1. 目标框误差 = 目标框中心点距离 + 目标框IoU
![image.png](/blogs/mask2former/02b85bf5-4995-4af0-aba8-cd407d204f3a.png?w=240)


缺点：训练很慢、推断很慢、对于物体识别效果好，但是对于小物体识别效果并不好（由于Transformer关注全局特征的特性）


DETR中，随着训练的进行，object query得出的目标框一步步接近ground truth。

（因为匈牙利匹配算法的存在，究竟是哪个object query在预测某一指定目标物体是可能在训练中发生变化的）

[video] citadelattachment-1805501192596934668.mp4
[video] citadelattachment-1805501194878935072.mp4
Transformer Encoder注意力的可视化

每个点更关心自己对应的物体整体

![image.png](/blogs/mask2former/ed17bb95-d7cf-4456-b808-b392571bc745.png?full=1)

Transformer Decoder注意力的可视化

每个框更关心物体的边界

![image.png](/blogs/mask2former/f4dc4cc3-bb8b-43c2-a27f-b4e7cbb98e18.png?w=336)

Object Query 可视化，绿色表示小框，红色表示水平大框，蓝色表示竖直大框。每个query关注的位置都有一定各自的倾向，并且都会关注中心较大物体。

这100个Object Query就像100个人一样，各自关注的地方都不一样

![image.png](/blogs/mask2former/52a5bb38-c852-4a4d-94f3-40f77835a181.png?w=864)


> 

论文：[https://arxiv.org/abs/2005.12872](https://arxiv.org/abs/2005.12872)

Reference：

- [知乎-Transformer目标检测之DETR](https://zhuanlan.zhihu.com/p/387102036)
- [B站-[论文简析]DETR: End-to-End Object Detection with Transfromers[2005.12872]](https://www.bilibili.com/video/BV1T64y1D7NY/)
- [B站-DETR 论文精读【论文精读】](https://www.bilibili.com/video/BV1GB4y1X72R)
- [知乎-不知道DETR怎么训练，来看看object query匹配gt的可视化过程](https://zhuanlan.zhihu.com/p/592381828)



### 2.3 MaskFormer（2021）

> 

核心创新：

- 根据类别生成mask，而非根据每个pixel预测类别
![image.png](/blogs/mask2former/f1556fb5-18f4-48de-9904-85c199b70ef7.png?full=1)


![image.png](/blogs/mask2former/bcf5355b-20ac-4620-8a9a-629f29032846.png?w=432)

> 

模型总结

1. 图片经过CNN（ResNet50，ResNet101，Swin-Transformer）做特征提取，缩小面积，增多通道数。
1. 再经过一个pixel decoder（FPN特征金字塔模型，卷积一层一层扩大），还原成原来的H和W，作为pixel embedding（256）
1. 生成N个可训练的query（N远大于图中可能的物体数），和DETR一样。
1. N个query进入一个transformer decoder（和DETR一样），其中多头注意力中的V和K使用图像特征，生成N个结果
1. N个结果经过一个MLP+softmax，生成N个class预测
1. N个结果再经过另外一个MLP，转化为N个mask embedding（256）
1. 将mask embedding 与 pixel embedding做点积，再经过一个sigmoid，生成N个0-1 mask矩阵
1. 将mask矩阵与class矩阵做点积，得到K个类别各自的分类mask
1. 对于语义分割任务，类型是固定的，不需要做二部图匹配的，只需要依据像素计算loss即可。（但是论文中一处细节提到，在语义分割中用二部图匹配效果会更好）
  1. Loss = 分类Loss + mask Loss （与DETR一致）
1. 对于非语义分割任务，比如实例分割，还是需要用到二部图匹配的。（但实际上MaskFormer在实例分割和全景分割中表现都不是非常好，Mask2Former中专门提到了这点）

缺点：训练推理很慢、很耗显存、在实例和全景分割效果没有语义分割好

用一个语义分割和实例分割的结果，展示了MaskFormer在不同类型分类任务中都有不错的表现。

![image.png](/blogs/mask2former/376b4026-e4c0-4829-8751-58bdc837949c.png?w=576)

> 

论文：[https://arxiv.org/abs/2107.06278](https://arxiv.org/abs/2107.06278)

Reference：

- [B站-[论文简析]Per-Pixel Classification is Not All You Need for Semantic Seg[2107.06278]](https://www.bilibili.com/video/BV17f4y1A7XR/)



### 2.4 Mask2Former（2021）

> 

核心创新：

- 更改Transformer Decoder结构，增加了masked结构
- 在Transformer Decoder中使用提出特征金字塔结构
![image.png](/blogs/mask2former/afb03827-be46-4e5c-a61f-10e31183799b.png?w=384)

> 

模型总结

1. 全图的交叉注意力收敛较为缓慢，交叉注意力需要许多训练时间才能学会关注局部对象区域。因此在Transformer Decoder中加入masked attention部分，让交叉注意力集中在前景区域标准的带残差的交叉注意力
  1. 原注意力：
![image.png](/blogs/mask2former/8b985dab-1b07-4612-bf1c-6c4518a4b2db.png?w=192)

  1. 改进后：
![image.png](/blogs/mask2former/a9f081ad-92a1-4eb0-871d-16686c7e9956.png?w=288)

  1. 其中
![image.png](/blogs/mask2former/60226e96-f338-4f68-96dd-39e1cf57c251.png?w=240)

M_{l-1}(x,y)代表前一层decoder的mask prediction

1. 在Transformer Decoder中，有L个3层结构，每个3层结构，其中的每一层的V和K，使用的是pixel decoder中放缩程度不一样的image features
1. 在Transformer Decoder中，先做masked attention，再做self attention。
1. 评估loss的时候并不用全图，而是随机采样点

模型评估结果

全景分割

![image.png](/blogs/mask2former/092f6ee7-157e-418f-887f-6a6b99c2133e.png?full=1)

实例分割

![image.png](/blogs/mask2former/9bfcce90-be11-45e9-acce-640d96bcf992.png?full=1)

语义分割

![image.png](/blogs/mask2former/bc116231-b2ef-4cdd-8956-c3c3c611a734.png?w=288)

同样的4个query在不同图片中关注的位置相对固定，query实质上起到了“region proposals”的作用

![image.png](/blogs/mask2former/1f522e7b-29e5-47af-8b4b-36d02c9fab41.png?w=384)

> 

论文：[https://arxiv.org/abs/2112.01527](https://arxiv.org/abs/2112.01527)

Reference：

- [B站-[论文速览]Masked-attention Mask Tr. for Universal Image Segmentation[2112.01527]](https://www.bilibili.com/video/BV1ob4y1B7hp/)

`;
