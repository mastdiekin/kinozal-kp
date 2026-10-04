import { props } from "./props";

export const svg = `<svg enable-background="new 0 0 70 70" version="1.1" viewBox="0 0 70 70" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="m35 0c-19.3 0-35 15.7-35 35s15.7 35 35 35 35-15.7 35-35-15.7-35-35-35zm-13.3 13.5c4.7 0 8.4 3.7 8.4 8.4s-3.7 8.4-8.4 8.4-8.4-3.7-8.4-8.4c0.1-4.7 3.8-8.4 8.4-8.4zm0 43c-4.7 0-8.4-3.7-8.4-8.4s3.7-8.4 8.4-8.4 8.4 3.7 8.4 8.4c-0.1 4.7-3.8 8.4-8.4 8.4zm9.7-17.9c-2-2-2-5.3 0-7.3s5.3-2 7.3 0 2 5.3 0 7.3-5.3 2.1-7.3 0zm16.9 17.9c-4.7 0-8.4-3.7-8.4-8.4s3.7-8.4 8.4-8.4 8.4 3.7 8.4 8.4c-0.1 4.7-3.8 8.4-8.4 8.4zm0-26.4c-4.7 0-8.4-3.7-8.4-8.4s3.7-8.4 8.4-8.4 8.4 3.7 8.4 8.4c-0.1 4.7-3.8 8.4-8.4 8.4z" fill="#ffffff"/></svg>`;

const base64svg = encodeURI(`data:image/svg+xml,${svg}`).replace("#", "%23");

export const CLASS = {
	wrapper: "element__wrapper",
	ratingButton: "element__rating-button",
	ratingDiv: "element__rating-div",
	preloader: "element__preloader",
	static: "static",
	error: "element__error",
} as const;

export const styles = `
.${CLASS.ratingButton},
.${CLASS.ratingDiv}{
    display: block;
    position: absolute;
    bottom: 0;
    font-size: 12px;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    line-height: 25px;
    background-color: ${props.brand};
    border: 0;
    color: #fff;
    outline: none;
    cursor: pointer;
    opacity: 0;
    transition: all ${props.transition};
    overflow: hidden;
}
.${CLASS.ratingDiv} {
    opacity: 1;
    cursor: default;
    min-width: 50%;
    min-height: 55px;
    width: auto;
    border-radius: 4px 0 0 0;
    transform: translate(0, 0);
    left: auto;
    right: 0;
    padding: 5px;
    box-sizing: border-box;
}
.${CLASS.ratingDiv} .element__preloader {
    border-radius: 4px 0 0 0;
}
.${CLASS.ratingDiv}.${CLASS.error} {
    cursor: pointer;
}
.${CLASS.ratingDiv}.${CLASS.error}:hover {
    background-color: ${props._brand};
}
.${CLASS.ratingButton}:hover {
    background-color: ${props._brand};
}
.${CLASS.wrapper} {
    display: block;
    float: left;
    margin: 0 5px 5px 0;
    position: relative;
    *zoom: 1;
}
.${CLASS.wrapper} a {
    position: relative;
    display: block;
    margin: 0 !important;
}
.${CLASS.wrapper}:hover > .${CLASS.ratingButton} {
    opacity: 1;
}
.${CLASS.wrapper}::after {
    content: " ";
    display: table;
    clear: both;
}
.${CLASS.preloader} {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0,0,0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all ${props.transition};
}
.${CLASS.preloader} svg {
    height: 50px;
    fill: ${props._brand};
    animation: linear 2s rotate infinite;
}
.${CLASS.preloader} svg path {
    fill: ${props._brand};
}
.${CLASS.static} {
    opacity: 1;
    background-color: ${props.brand};
    line-height: 20px;
}
.${CLASS.static}::before {
    content: url('${base64svg}');
    width: 28px;
    position: absolute;
    bottom: -15px;
    left: -10px;
}
.${CLASS.static}:hover {
    background-color: ${props.brand} !important;
}
.final__rating {
    display: block;
    text-align: center;
}
.tp1_a {
    display: block;
    float: left;
    position: relative;
}
.tp1_desc > .tp1_a {
    float: right;
}
.stable a img {
    width: 107px;
    height: 157px
}
@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
`;

export const SELECTOR = {
	topPageBody: ".tp1_body",
	topPageLinks: ".mn1_content > .bx1.stable a",
	ratingsList: ".men.w200",
} as const;

export const disabledStyles = `
.stable a {
    float: none;
}
`;
