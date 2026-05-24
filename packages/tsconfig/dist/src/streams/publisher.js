const publisher = (client) => {
    return {
        async publish(type, payload) {
            await client.publish({
                type,
                payload
            });
        }
    };
};
export default publisher;
//# sourceMappingURL=publisher.js.map