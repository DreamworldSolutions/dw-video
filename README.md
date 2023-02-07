# dw-video

A WebComponent to show a video on documentation & blog sites.

## Behaviours
- Currntly support only [viemo](https://vimeo.com/) video.
- Auto compute height based on width css style.

## Example

```html
<dw-video
  src='https://player.vimeo.com/video/313303279'>
</dw-video>
```

```css
dw-video {
  width: 500px;
}
```

## Properties

| Property | Attribute | Type     | Description                                      |
|----------|-----------|----------|--------------------------------------------------|
| `src`    | `src`     | `string` | Video path/source.<br />It should be vimeo video path e.g. https://player.vimeo.com/video/313303279. |