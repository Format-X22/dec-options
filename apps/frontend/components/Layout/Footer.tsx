import React from 'react';
import styled from 'styled-components';

const StyledFooter = styled.footer`
    width: 100%;
    display: flex;
    flex-direction: column;
    background: #1b1b1b;
    padding: 32px;

    a {
        color: #fff;
    }
    .logo-link {
        display: flex;
        align-items: center;
        img {
            width: 50px;
            height: 50px;
            margin-right: 25px;
        }
        span {
            font-size: 34px;
            line-height: 34px;
        }
    }
    .social-links {
        display: flex;
        flex-direction: column;
        margin-top: 20px;
        margin-right: 50px;

        a {
            font-size: 16px;
            font-weight: 500;
            padding: 10px 0;
        }
    }
    .link-row {
        display: flex;
    }
`;

const Footer = () => {
    const decommasTools = [
        { link: 'https://decommas.io/#tools', text: 'Tools' },
        { link: 'https://decommas.io/#contact', text: 'Contact Us' },
        { link: 'mailto:info@decommas.io', text: 'info@decommas.io' },
    ];
    const socialLinks = [
        { link: 'https://twitter.com/decommas', text: 'Twitter' },
        { link: 'https://discord.gg/FyENCJt8nY', text: 'Discord' },
        { link: 'https://t.me/decommas', text: 'Telegram' },
        { link: 'https://medium.com/@DeCommas/', text: 'Medium' },
    ];
    return (
        <StyledFooter>
            <a href='https://decommas.io' className='logo-link'>
                <img src='/opex/public/decommas.svg' alt='Decommas' />
                <span>DeCommas</span>
            </a>
            <div className='link-row'>
                <div className='social-links'>
                    {decommasTools.map(({ link, text }, index) => {
                        return (
                            <a key={`decommas-links-${index}`} href={link}>
                                {text}
                            </a>
                        );
                    })}
                </div>
                <div className='social-links'>
                    {socialLinks.map(({ link, text }, index) => {
                        return (
                            <a key={`social-links-${index}`} target='_blank' rel='noreferrer' href={link}>
                                {text}
                            </a>
                        );
                    })}
                </div>
            </div>
        </StyledFooter>
    );
};

export default Footer;
