export const PreviewPair = ({ src, styleRight }) => (
  <>
    <h1 style={{ color: "#070E05", fontSize: 18, margin: "0 0 30px 0", fontStyle: "italic" }}>
      Preview Augmented Sample Images
    </h1>
    <ul className="PreviewAugment">
      <li><figure>{src && <img src={src} alt="Sample" />}</figure></li>
      <li><figure><img src={src} alt="Augmented" style={styleRight || {}} /></figure></li>
    </ul>
  </>
);