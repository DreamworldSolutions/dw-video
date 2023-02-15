# dw-video

A WebComponent to show a video thumbnail on documentation & blog sites.

## Behaviours
- Currntly support only [Vimeo](https://vimeo.com/) video.
- Auto compute height based on width css style.
- On thumbnail click, open [Vimeo](https://vimeo.com/) video in new tab.
- If you want to show [Vimeo](https://vimeo.com/) actual video instead of a thumbnail then set the `inline` property as a `true`.

## Examples
  - Default Examples
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

- Inline Video
    ```html
      <dw-video
        inline
        src='https://player.vimeo.com/video/313303279'>
      </dw-video>
    ```

    ```css
      dw-video {
        width: 500px;
      }
    ```

## Properties

| Property              | Attribute       | Type      | Default | Description                                      |
|-----------------------|-----------------|-----------|---------|--------------------------------------------------|
| `inline`              | `inline`        | `boolean` |         | If `true` then shows a inline vimeo video, Otherwise shows a viemo video thumbnail. |
| `src`                 | `src`           | `string`  |         | Video path/source.<br />It should be vimeo video path e.g. https://player.vimeo.com/video/313303279. |

## Events

| Event    | Description                                      |
|----------|--------------------------------------------------|
| `loaded` | when video thumbnail/inline-video is successfully loaded. |
