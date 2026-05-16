declare module "*.png" {
  const value: { src: string; height: number; width: number } | string;
  export default value;
}
