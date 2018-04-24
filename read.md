## Parallax Scrolling (with sass) ##

**Parallax** (시차 : 관측 위치에 따른 물체의 위치나 방향의 차이)의 뜻에서도 볼 수 있듯이 물체의 위치와 방향의 차이로 사용자에게 평면적인 웹사이트가 아니라 마치 살아 숨쉬는 듯한 느낌을 만들 수 있음.ddd

**장점**
- 페이지 컨텐츠를 소비하지 않음 -> 한 페이지로 구성 가능.
- 컨텐츠에 따라 사용자의 시선을 서비스 제공자가 원하는 방향으로 이끌수 있음.

**단점**
- 컨텐츠가 가로 또는 세로로 너무 길 때, 사용자가 지루함이나 불편함을 느낄 수 있음.
- 하나의 페이지로 구성 시 많은 리소스가 필요하기 때문에 초기 로딩속도가 느릴 수 있음.

### with SASS ###

VScode 에서 sass를 사용하려면 sass, Live sass compiler 두개의 플러그인을 설치해야 한다.....

- [sass](https://marketplace.visualstudio.com/items?itemName=robinbentley.sass-indented)
- [Live sass compliler](https://marketplace.visualstudio.com/items?itemName=ritwickdey.live-sass)

<img src="https://ritwickdey.gallerycdn.vsassets.io/extensions/ritwickdey/live-sass/1.3.0/1518981325878/Microsoft.VisualStudio.Services.Icons.Default" style="width:50px; height:50px;">

<img src="https://ritwickdey.gallerycdn.vsassets.io/extensions/ritwickdey/live-sass/1.3.0/1518981325878/Microsoft.VisualStudio.Services.Icons.Default" width=50px height=50px>

<img src="https://ritwickdey.gallerycdn.vsassets.io/extensions/ritwickdey/live-sass/1.3.0/1518981325878/Microsoft.VisualStudio.Services.Icons.Default" width=50px height=50px>

> **Tip:** VS code에서 scss 파일을 컴파일하여 css 파일이 생성되어지기 위해서 **Live sass compiler** 항상 켜두어야 한다.

#### step 1) <i class="icon-file"></i> sass file 생성 ####
scss폴더를 만들고 .scss 파일을 만들어 스타일을 선언한다.

#### step 2) <i class="icon-pencil"></i> html include ####                        

```
<link rel="stylesheet" href="./css/base.css">
```

### JS ####

#### step 1) jquery link ####

[jQuery](https://jquery.com/)

