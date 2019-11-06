import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import Keycodes from 'common/keycodes'
import Chevron from 'images/svg/chevron-bottom.svg'

const DropdownContainer = styled.ul`
    list-style: none;
    position: relative;
    border: 1px solid var(--color-grey-7);
    cursor: pointer;
    padding: 0;
    border-radius: 4px;
    width: 15.2rem;
    height: 3.2rem;
    top: 25%;

    /* ul has no focus attributes, it needs to pass on active props instead */
    ${props => props.active && 'border-color: var(--color-green) !important;'}

    &:hover {
        border-color: var(--color-grey-5);
    }
`

const DropdownSelected = styled.li`
    color: var(--color-black-3);
    list-style-position: inside;
    white-space: nowrap;
    overflow: hidden;
    padding: 0 1.6rem;
    text-overflow: ellipsis;
    height: 100%;
    font-size: var(--text-size-xs);
    display: flex;
    align-items: center;
`

const ListContainer = styled.li`
    position: relative;
`

const ListItem = styled.li`
    color: var(--color-black-3);
    padding: 1rem 1.6rem;
    transition: background-color 0.1s linear, color 0.1s linear;
    list-style-position: inside;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--text-size-xs);

    &:hover {
        background-color: var(--color-grey-6);
    }
    &:focus {
        background-color: var(--color-grey-7);
        font-weight: bold;
    }
    &:focus,
    &:active {
        outline: none;
    }
`

const UnorderedList = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
    position: absolute;
    left: 0;
    top: 0.8rem;
    border-radius: 4px;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.16);
    transition: opacity 0.1s cubic-bezier(0, 0, 0.38, 0.9),
        max-height 0.25s cubic-bezier(0, 0, 0.38, 0.9);
    max-height: 0;
    overflow: hidden;
    background-color: var(--color-white);
    opacity: 0;
    ${props =>
        props.open &&
        css`
            opacity: 1;
            overflow: auto;
            max-height: 17rem;
        `}
`

const Arrow = styled(Chevron)`
    position: absolute;
    right: 8px;
    top: 25%;
    transition: transform 0.2s linear;
    ${props => (props.expanded ? 'transform: rotate(-180deg);' : '')}
`

const Dropdown = ({ default_option, onChange, option_list }) => {
    const [is_open, setOpen] = useState(false)
    const [selected_option, setSelectedOption] = useState('')
    const nodes = new Map()
    const dropdown_ref = useRef(null)

    useEffect(() => {
        setSelectedOption(default_option)

        const handleClickOutside = e => {
            if (!dropdown_ref.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('click', handleClickOutside)

        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [])

    const toggleListVisibility = e => {
        e.preventDefault()
        const open_dropdown =
            e.keyCode === Keycodes.space ||
            e.keyCode === Keycodes.enter ||
            e.keyCode === Keycodes.tab

        // adding each item nodes a listener (click and keys)
        // and filter if there is null nodes in the array
        Array.from(nodes.values())
            .filter(node => node !== null)
            .forEach(node => addItemListener(node))

        if (e.keyCode === Keycodes.escape) {
            closeList()
        }
        if (e.type === 'click' || open_dropdown) {
            setOpen(!is_open)
        }
        if (e.keyCode === Keycodes.down_arrow) {
            focusNextListItem(Keycodes.down_arrow)
        }
        if (e.keyCode === Keycodes.up_arrow) {
            focusNextListItem(Keycodes.up_arrow)
        }
    }

    const closeList = () => {
        setOpen(false)
    }

    const focusNextListItem = direction => {
        const activeElement = document.activeElement

        if (activeElement.id === 'selected_dropdown') {
            Array.from(nodes.values())[0].focus()
        } else {
            const active_nodes = nodes.get(activeElement.id)
            if (active_nodes) {
                if (direction === Keycodes.down_arrow) {
                    active_nodes.nextSibling && active_nodes.nextSibling.focus()
                } else if (direction === Keycodes.up_arrow) {
                    active_nodes.previousSibling && active_nodes.previousSibling.focus()
                }
            }
        }
    }

    const addItemListener = node => {
        node.addEventListener('click', e => {
            e.preventDefault()
            onChange(e)
            closeList()
        })
        node.addEventListener('keydown', e => {
            e.preventDefault()
            switch (e.keyCode) {
                case Keycodes.enter:
                    onChange(e)
                    closeList()
                    break
                case Keycodes.tab:
                    onChange(e)
                    closeList()
                    break
                case Keycodes.down_arrow:
                    focusNextListItem(Keycodes.down_arrow)
                    break
                case Keycodes.up_arrow:
                    focusNextListItem(Keycodes.up_arrow)
                    break
                case Keycodes.escape:
                    closeList()
                    break
                default:
                    break
            }
        })
    }

    return (
        <DropdownContainer active={is_open} ref={dropdown_ref}>
            <DropdownSelected
                role="button"
                id="selected_dropdown"
                tabIndex="0"
                onClick={toggleListVisibility}
                onKeyDown={toggleListVisibility}
            >
                {selected_option}
                <Arrow expanded={is_open} />
            </DropdownSelected>
            <ListContainer aria-expanded={`${is_open ? 'true' : 'false'}`} role="list">
                <UnorderedList open={is_open}>
                    {option_list.map(option => (
                        <ListItem
                            tabIndex="0"
                            id={option.value}
                            key={option.value}
                            ref={c => nodes.set(option.value, c)}
                        >
                            {option.text}
                        </ListItem>
                    ))}
                </UnorderedList>
            </ListContainer>
        </DropdownContainer>
    )
}

Dropdown.propTypes = {
    default_option: PropTypes.string,
    onChange: PropTypes.func,
    option_list: PropTypes.array,
}

export default Dropdown
