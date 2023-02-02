# dw-video

A WebComponent to show a video on documentation & blog sites.

## Behaviours
- Currntly support only [viemo](https://vimeo.com/) video.
- Auto compute height or width based on `auto` property, give another value as a css of element.

## Example

```html
<dw-video
  auto='width'
  src='https://player.vimeo.com/video/313303279?&autoplay=0'>
</dw-video>
```

```css
<!-- In this above case you give a height css property as an element. -->
dw-video {
  height: 200px;
}
```

## Properties

| Property | Attribute | Type     | Description                                      |
|----------|-----------|----------|--------------------------------------------------|
| `auto`   | `auto`    | `string` | Auto compute css property name.<br />Default value: height<br />Possible value: height, width. |
| `src`    | `src`     | `string` | Video path/source.<br />It should be vimeo video path e.g. https://player.vimeo.com/video/313303279?&autoplay=0. |