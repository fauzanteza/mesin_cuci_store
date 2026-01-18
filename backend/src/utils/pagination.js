export const paginate = async (model, options) => {
    const { page = 1, limit = 10, where = {}, include = [], order = [], attributes = null, distinct = false } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await model.findAndCountAll({
        where,
        include,
        order,
        attributes,
        limit,
        offset,
        distinct,
    });

    return {
        data: rows,
        pagination: {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            itemsPerPage: limit,
        },
    };
};
